from .settings import Settings
from .dependencies import pd, dt, re, slugify, OrderedDict, HumanName


def get_basic_df(get_filter=False):
    """
    Function that returns our current data (V1).
    If `get_filter` is set to True, we get an extra column, "filter",
    containing any reason why the row should be filtered
    (see function `filtered` below for more documentation).
    """

    def filtered(row, filter_year_range=Settings.YEAR_RANGE, trues=False):
        """
        Takes a DataFrame's `row` and returns False if the row does NOT contains disqualifying information:
            (1) Row should be excluded or whether we're unsure whether they should be included
            (2) Has no city, no performer, and no venue
            (3) Performer name has "unnamed" in it
            (4) Row has no valid date
            (5) The date's year not within filter_year_range
        If the row contains disqualifying information, it will return:
            (1) `unsure_exclude`
            (2) `insufficient_data`
            (3) `unnamed_performer`
            (4) `no_date`
            (5) `outside_year_scope`
        """
        if row['Exclude from visualization'] or row['Unsure whether drag artist']:
            return 'unsure_exclude'

        no_city = row['City'] == ''
        no_performer = row['Performer'] == ''
        no_venue = row['Venue'] == ''
        unnamed_performer = 'unnamed' in row['Performer'].lower()

        if no_city and no_performer and no_venue:
            if trues:
                return True
            return 'insufficient_data'

        if unnamed_performer:
            if trues:
                return True
            return 'unnamed_performer'

        try:
            date = dt.strptime(row.Date, '%Y-%m-%d')
        except ValueError:
            if trues:
                return True
            return 'no_date'

        if filter_year_range and filter_year_range[0] <= date.year <= filter_year_range[1]:
            pass  # in the range!
        else:
            if trues:
                return True
            return 'outside_year_scope'

        return False

    def get_true_value(row, kind):
        if kind == 'source':
            if row['Source clean'] != '':
                return row['Source clean']
            return row['Source']
        if kind == 'performer':
            if row['Normalized performer'] != '':
                return row['Normalized performer']
            # We don't actually use `Performer first-name` and `Performer last-name`
            # so technically these columns can just be dropped
            if row['Performer first-name'] != '' and row['Performer last-name'] != '':
                return row['Normalized performer']
            return row['Performer']
        if kind == 'city':
            if row['Normalized City'] != '':
                return row['Normalized City']
            return row['City']
        if kind == 'revue':
            if row['Normalized Revue Name'] != '':
                return row['Normalized Revue Name']
            return row['Revue name']
        if kind == 'venue':
            if row['Normalized Venue'] != '':
                return row['Normalized Venue']
            return row['Venue']
        raise NotImplementedError(f'kind `{kind}` is not yet implemented')

    def find_ref(row, eima=True):
        source = row.get('Source', '')
        source += ' ' + str(row.get('EIMA_ID', ''))
        source += ' ' + str(row.get('Newspapers_ID', ''))
        source += ' ' + str(row.get('EIMA', ''))
        source += ' ' + str(row.get('EIMA_Search', ''))
        source += ' ' + str(row.get('Search (newspapers.com)', ''))
        source += ' ' + str(row.get('Source clean', ''))

        is_eima = 'eima' in source.lower() or 'variety' in source.lower() or 'billboard' in source.lower()
        has_ref = re.search(r'(\d{7,10})', source)
        refs = list(set(re.findall(r'(\d{7,10})', source)))
        if has_ref and eima and is_eima:
            return '|'.join(refs)

        if has_ref and not eima and not is_eima:
            return '|'.join(refs)

        return ''

    # TODO: Add cache here to speed up the script.
    df = pd.read_csv(Settings.DATA_SOURCE)
    df = df.fillna('')
    df = df.replace('—', '')
    df = df.replace('—*', '')

    # Normalize dataframe
    df['Source'] = df.apply(lambda row: get_true_value(row, 'source'), axis=1)
    df['Venue'] = df.apply(lambda row: get_true_value(row, 'venue'), axis=1)
    df['Performer'] = df.apply(lambda row: get_true_value(row, 'performer'), axis=1)
    df['City'] = df.apply(lambda row: get_true_value(row, 'city'), axis=1)
    df['Revue'] = df.apply(lambda row: get_true_value(row, 'revue'), axis=1)

    # First, set up our references to EIMA and newspapers.com
    df['EIMA'] = df.apply(lambda row: find_ref(row), axis=1)
    df['Newspapers.com'] = df.apply(lambda row: find_ref(row, False), axis=1)

    # Then drop the unnecessary columns
    normalization_columns = ['Source clean', 'Normalized performer', 'Performer first-name', 'Performer last-name',
                             'Normalized City', 'Normalized Revue Name', 'Normalized Venue', 'EIMA_ID', 'EIMA_Search',
                             'Newspapers_ID', 'Search (newspapers.com)']
    df = df.drop_columns(normalization_columns)

    if get_filter:
        df['filter'] = df.apply(lambda row: filtered(row, trues=True), axis=1)

    return df


# Setting up custom functions on the pd.DataFrame

def extract_addresses_dict(normalized_df):
    addresses = {}
    rows_with_addresses = normalized_df[normalized_df['Address'] != '']
    warnings = []
    for x in zip(rows_with_addresses['Date'], rows_with_addresses['Source'], rows_with_addresses['Venue'],
                 rows_with_addresses['Address']):
        date, source, venue, address = x
        if venue == '':
            warnings.append(address)
        else:
            if venue not in addresses:
                addresses[venue] = {}
            if source not in addresses[venue]:
                addresses[venue][source] = address
    if len(warnings):
        print(f'Warning: {len(warnings)} Venues with no names have addresses:')
        print('- ' + '- '.join(warnings))

    return addresses


pd.DataFrame.extract_addresses_dict = extract_addresses_dict


def get_comments(df, comment_field='Comment on edge: revue', match_field='Revue', transform=None):
    comments = {}
    rows_with_comments = df[df[comment_field] != '']
    warnings = []
    for date, source, match, comment in zip(rows_with_comments['Date'], rows_with_comments['Source'],
                                            rows_with_comments[match_field], rows_with_comments[comment_field]):
        comment = str(comment).strip()
        if transform:
            comment = transform(comment)
        if match == '':
            warnings.append(str(comment)[:40] + '...' + ' (' + str(date) + ')')
        else:
            if match not in comments:
                comments[match] = {}
            if source not in comments[match]:
                comments[match][source] = comment
    if len(warnings):
        print(f'Warning: {len(warnings)} mentions in `{comment_field}` with no value have comments:')
        print('- ' + '\n- '.join(warnings))

    return comments


pd.DataFrame.get_comments = get_comments


def get_revue_comments_dict(df):
    return df.get_comments('Comment on edge: revue', 'Revue')


pd.DataFrame.get_revue_comments_dict = get_revue_comments_dict


def get_performer_comments_dict(df):
    return df.get_comments('Comment on node: performer', 'Performer')


pd.DataFrame.get_performer_comments_dict = get_performer_comments_dict


def get_venue_comments_dict(df):
    return df.get_comments('Comment on node: venue', 'Venue')


pd.DataFrame.get_venue_comments_dict = get_venue_comments_dict


def get_city_comments_dict(df):
    return df.get_comments('Comment on node: city', 'City')


pd.DataFrame.get_city_comments_dict = get_city_comments_dict


def drop_columns(df, columns):
    df_columns = [x for x in df.columns]
    for column in columns:
        if column in df_columns:
            df = df.drop(column, axis=1)
        else:
            print(f"Warning: tried to drop column `{column}` but it did not exist.")
    return df


pd.DataFrame.drop_columns = drop_columns


def slugify_column(df, column='Performer'):
    if not column == 'Performer':
        all_values = list(sorted(set([x for x in df[column] if x and not x.startswith('—')])))
    else:
        all_values = list(
            sorted(set([x for x in df[column] if x])))  # we have to include the ones that start with — here
    values_dict = {}
    for value in all_values:
        done = False
        i = 0
        while not done:
            if i == 0:
                if not slugify(value) in values_dict:
                    values_dict[slugify(value)] = value
                    done = True
                else:
                    i += 1
            else:
                print('Warning: Multiple values with the same value. This should not happen:', value)
                if f'{slugify(value)}-{i}' not in values_dict:
                    values_dict[f'{slugify(value)}-{i}'] = value
                    done = True
                else:
                    i += 1
    return {v: k for k, v in values_dict.items()}  # reversed


pd.DataFrame.slugify_column = slugify_column


def make_calendar(df):
    calendar = OrderedDict()

    years = [pd.to_datetime(x).year for x in df.Date]
    min_year = min(years)
    max_year = max(years)

    years = range(min_year, max_year + 1)
    months = range(1, 13)
    for year in years:
        if year not in calendar:
            calendar[year] = OrderedDict()
        for month in months:
            # 31 = jan, mar, may, jul, aug, oct, dec
            # 30 = apr, jun, sep, nov
            # 28 = feb
            if month not in calendar[year]:
                calendar[year][month] = OrderedDict()
            if month == 2:
                days = range(1, 30)  # adding the 29th day despite it not always existing
            elif month in [4, 6, 9, 11]:
                days = range(1, 31)
            elif month in [1, 3, 5, 7, 8, 10, 12]:
                days = range(1, 32)
            else:
                raise RuntimeError('error')

            for day in days:
                if day not in calendar[year][month]:
                    calendar[year][month][day] = 0

    for date in [pd.to_datetime(date) for date in df.sort_values('Date').Date]:
        calendar[date.year][date.month][date.day] += 1

    return calendar


pd.DataFrame.make_calendar = make_calendar


def get_name_mapping(df):
    return {x: (HumanName(x).first, HumanName(x).middle, HumanName(x).last) for x in df.Performer}


pd.DataFrame.get_name_mapping = get_name_mapping
