# -*- coding: utf-8 -*-
# ---
# jupyter:
#   jupytext:
#     formats: py:light
#     text_representation:
#       extension: .py
#       format_name: light
#       format_version: '1.5'
#       jupytext_version: 1.13.0
#   kernelspec:
#     display_name: 'Python 3.8.5 64-bit (''anaconda3'': virtualenv)'
#     language: python
#     name: python385jvsc74a57bd0e2492d90a0e4d5066ae5153b223475f66c93218433dc322da607b5802c2cc184
# ---

# +
from assistant import *

YEAR_RANGE = (1900, 1950)

# +
# Get our main DataFrame
df = get_basic_df(get_filter=True, year_range=YEAR_RANGE)
df = df.drop(df[df['filter'] == 'unsure_exclude'].index) # Drop unsure/excluded before node data
df = df.drop_duplicates(subset=['Date', 'Performer', 'Venue', 'City', 'State', 'Source']) # Drop duplicates based on subset of columns
# Drop filtered data
df = df.drop(df[df['filter'] != False].index)

# Set up helpful columns
df['has_unique_venue'] = df.apply(lambda row: row['Unique venue'] != '' and not row['Unique venue'].startswith('—'), axis=1)
df['has_performer'] = df.apply(lambda row: row.Performer != '', axis=1)
df['has_city'] = df.apply(lambda row: row.City != '' and row.City != '?', axis=1)
df['has_revue'] = df.apply(lambda row: row.Revue != '' and not row.Revue.startswith('('), axis=1)

# Drop columns
df = df.drop_columns(['Category', 'Newspapers.com', 'Blackface', 'Sepia', 'Fan dancer/Sally Rand', 'Exotic/erotic/oriental dancer/Gypsy', 'Has image', 'Legal name', 'Alleged age', 'Assumed birth year', 'Search (fulton)',
                      'Imported from former archive', 'Edge Comment', 'Comment on node: performer', 'Comment on node: venue', 'Comment on node: city', 'Comment on edge: revue', 'Exclude from visualization', 'Address', 'Unsure whether drag artist', 'filter'])

columns, rows = df.shape
print(f'Data has {columns} columns organized in {rows} rows.')
# -



{city for city, row in df[df['has_city']].groupby('City')}







# +
# Restrict to 1930s
df['1930s'] = df.apply(lambda row: 1940 > pd.to_datetime(row.Date).year > 1929, axis=1)
df_30s = df.drop(df[df['1930s']==False].index)

df_30s.shape

# +
NAME = re.compile(r"(.*)('s|and His|and Her|and Their).*")
def check_for_irrelevant(string):
    string = string.lower()
    return (not 'tavern' in string
            and not 'club' in string
            and not 'cabin' in string
            and not 'band box' in string
            and not 'opera' in string
            and not 'palace' in string
            and not 'garden of' in string
            and not 'lodge' in string
            and not 'hotel' in string
            and not 'cafe' in string
            and not 'lair' in string
            and not 'inn' in string
            and not 'garden' in string
            and not 'hofbrau' in string
            and not 'village' in string
            and not 'grille' in string
            and not 'spinning wheel' in string
            and not 'unnamed' in string
            and not 'bandbox' in string
            and not 'finocchio' in string
            and not 'blue ribbon' in string
            and not 'gay 90' in string
            and not 'grand view park' in string
            and not 'nite spot' in string
            and not 'st. patrick' in string
           )

for revue, rows in df_30s[df_30s['has_revue']].groupby('Revue'):
    s = NAME.search(revue)
    try:
        hits = s.groups()
        name = hits[0].strip()
        if name == 'Billy Herrera':
            name = 'Billy "Senorita" Herrera'
    except:
        hits = []
        name = ''
    if s and len(name.split(' ')) > 1 and check_for_irrelevant(name):
        if set(x for x in rows.Performer if x) and not name in [x for x in rows.Performer if x]:
            print(f'{revue} does not have "{name}" as part of the revue')
            print('--> Dates:', [x for x in rows.Date])
            print('--> Performers:', set(x for x in rows.Performer if x))
            print()
# -





for source, row in df_30s[df_30s['Source'] != ''].groupby('Source'):
    if len(set(x for x in row.Newspaper_ID))>1:
        print(source, 'has multiple newspaper IDs registered:')
        print('- ' + '\n- '.join(set(x for x in row.Newspaper_ID)))
        
    if len(set(x for x in row.Date)) > 1:
        check = set(
            r.Date
            for i, r in row.iterrows()
            if r['Inferred date'] != True
        )
        if len(check) > 1:
            print(source, 'contains multiple dates without signaling whether they are inferred or not')
            print('- ' + '\n- '.join(sorted(set(x for x in row.Date))))
            print(check)


