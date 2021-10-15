from .utils import Path
from .dependencies import dt, glob, re

try:
    from IPython.display import clear_output
    ipython = True
except ModuleNotFoundError:
    ipython = False

MAPPINGS = {
    ('Albert', 'Henry', 'Cook'): ['Albert Henry', 'Cook'],
    ('Baby', 'Jan', 'Ray'): ['Baby Jan', 'Ray'],
    ('Edward', 'Albert', 'Crawford'): ['Edward Albert', 'Crawford'],
    ('Frank', 'Barrett', 'Carman'): ['Frank', 'Barrett Carman'],
    ('J.', 'John', 'Howard'): ['J. John', 'Howard'],
    ('James', 'Ernest', 'Allen'): ['James Ernest', 'Allen'],
    ('La', 'Belle', 'Rose'): ['La Belle', 'Rose'],
    ('Nina', 'Mae', 'McKinney'): ['Nina Mae', 'McKinney'],
    ('Nora', 'Corona', 'Hancock'): ['Nora', 'Corona Hancock'],
    ('Ray', 'Erline', 'Garrison'): ['Ray', 'Erline Garrison'],
    ('Richard', 'Snooks', 'Davis'): ['Richard', 'Snooks Davis'],
    ('Sepia', 'Gloria', 'Swanson'): ['Gloria', 'Swanson'],
    ('Sepia', 'Greta', 'Garbo'): ['Greta', 'Garbo'],
    ('Sepia', 'Mae', 'West'): ['Sepia Mae', 'West'],
    ('Sweet', 'Mama', 'Sue'): ['Sweet Mama Sue'],
    ('Thompson', 'Twin', '1'): ['Thompson Twins'],
    ('Thompson', 'Twin', '2'): ['Thompson Twins'],
    ('Titanic', 'Kit', 'Russell'): ['Kit', 'Russell'],
    ('William', 'Lee', 'Becker'): ['William', 'Lee Becker'],
    ('Doran,', 'West,', 'and', 'Doran'): ['Doran, West, and Doran'],
    ('Elsie', 'the', 'Cobra', 'Woman'): ['Elsie the Cobra Woman'],
    ('F', '&', 'G', 'Doran'): ['F. and G.', 'Doran'],
    ('Lynn', 'and', 'De', 'Marco'): ['Lynn and De Marco'],
    ('May', 'West', 'of', 'the', 'East'): ['Sepia Mae', 'West'],
    ('Mother', 'Smother/Sepia', 'Marlene', 'Dietrich'): ['Marlene', 'Dietrich']
}


def make_performer_clippings(list_of_performers):
    _ = {}

    def get_comment(name) -> str:
        if file_comment.search(name):
            return file_comment.search(name).groups()[1]
        return ''

    # ARCHIVE_PNG_PATHS = [x.lower()
    #   for x in glob.glob(
    #   '/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/**/*.png',
    #   recursive=True)]
    archive_folders = [x.lower() for x in glob.glob(
        '/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/*')]
    file_comment = re.compile(r'(.*) ?\[(.*)]')

    for performer in list_of_performers:
        found: str = ''

        if not performer:
            continue

        names = performer.split(' ')
        if len(names) == 3:
            if names[1] == 'La' or names[1] == 'Le' \
                    or names[1] == 'De' or names[1] == 'Del' \
                    or names[1] == 'St.' \
                    or names[1] == 'Van' or names[1] == 'Val' \
                    or names[1] == 'the':
                names = [f'{names[0]}', f'{names[1]} {names[2]}']
            elif names[1] == '&' or names[1] == 'and':
                names = [f'{names[0]} {names[1]} {names[2]}']
            elif len(names[0]) < 3 and len(names[1]) < 3:
                names = [names[2], f'{names[0]} {names[1]}']
            elif len(names[1]) < 3:
                names = [f'{names[0]} {names[1]}', f'{names[2]}']
            elif names[0] == 'The':
                names = [f'{names[0]} {names[1]}', f'{names[2]}']
            elif names[0] == 'Miss':
                names = [f'{names[0]}', f'{names[1]}']
            elif names[1].startswith('"') or names[1].startswith('('):
                names = [f'{names[1]}', f'{names[2]}']
            else:
                if not MAPPINGS.get(tuple(names)):
                    print(names)
                else:
                    names = MAPPINGS.get(tuple(names))
        elif len(names) > 3:
            if not MAPPINGS.get(tuple(names)):
                print(names)
            else:
                names = MAPPINGS.get(tuple(names))

        names = [x.lower() for x in names]

        if len(names) == 2:
            search = [x for x in archive_folders
                      if (f'{names[1]}, {names[0]}' in x
                          or f'{names[0]} {names[1]}' in x)
                      and 'performer' in get_comment(x)]
            if len(search) == 1:
                found: str = search[0]
            else:
                pass  # print(f'{names[1]}, {names[0]}', search)

        elif len(names) == 1:
            search = [x for x in archive_folders if Path(x).stem.startswith(names[0])]
            if len(search) == 1:
                found: str = search[0]
            else:
                pass  # print(names, search)
        elif len(names) == 3:
            search = [x for x in archive_folders
                      if (f'{names[2]}, {names[0]} {names[1]}' in x
                          or f'{names[0]} {names[1]}' in x)
                      and 'performer' in get_comment(x)]
            if len(search) == 1:
                found: str = search[0]
            else:
                pass  # print(f'{names[2]}, {names[0]} {names[1]}', search)

        if found != '':
            file_name = Path(found).name
            comment: str = get_comment(file_name)
            if 'performer' not in comment and 'producer' not in comment:
                print(f'Warning: Found matching clippings folder with wrong name, so decoupling:'
                      f'{performer} ≠ {file_name}')
                found = ''  # if not a performer or producer
        else:
            print(f'Warning: {performer} does not exist in clippings')
            found = ''

        _[performer] = found

    return _


class Clippings:
    EXPIRY_DAYS = 7

    CACHE_ALL_CLIPPINGS = '.clippings_cache/CACHE_ALL_CLIPPINGS.json'
    CACHE_ALL_CLIPPINGS_FILES = '.clippings_cache/CACHE_ALL_CLIPPINGS_FILES.json'
    CACHE_ALL_CLIPPINGS = Path(CACHE_ALL_CLIPPINGS)
    CACHE_ALL_CLIPPINGS.verify_parent()
    CACHE_ALL_CLIPPINGS_FILES = Path(CACHE_ALL_CLIPPINGS_FILES)
    CACHE_ALL_CLIPPINGS_FILES.verify_parent()

    def __init__(self):
        if not self.cache_exists() or self.cache_expired():
            all_clippings, all_clippings_files = self.make()
            self.CACHE_ALL_CLIPPINGS.write_json(all_clippings)
            self.CACHE_ALL_CLIPPINGS_FILES.write_json(all_clippings_files)
        self.ALL_CLIPPINGS = self.CACHE_ALL_CLIPPINGS.read_json()
        self.ALL_CLIPPINGS_FILES = self.CACHE_ALL_CLIPPINGS_FILES.read_json()
        self.ALL_CLIPPINGS = {k.replace('null', ''): {x.replace('null', ''): y for x, y in v.items()} for k, v in
                              self.ALL_CLIPPINGS.items()}

    def cache_exists(self):
        return self.CACHE_ALL_CLIPPINGS.exists() and self.CACHE_ALL_CLIPPINGS_FILES.exists()

    def cache_expired(self, days=EXPIRY_DAYS):
        ts = self.CACHE_ALL_CLIPPINGS.stat().st_mtime
        past_date = dt.fromtimestamp(ts)
        difference = dt.utcnow() - past_date
        return difference.days > days

    @staticmethod
    def make():
        files = {}
        archive_folders = [x for x in glob.glob(
            '/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/*')]
        file_comment = re.compile(r'(.*) ?\[(.*)]')
        categories = {None: {None: []}}
        for folder_count, name in enumerate(archive_folders):
            if ipython:
                print(f'{folder_count}/{len(archive_folders)}: {name}')
                clear_output(wait=True)
            if file_comment.search(name):
                folder, category = file_comment.search(name).groups()
                clean_folder_name = Path(folder).name.strip()
                print(clean_folder_name)
                folder_categories = [x.strip() for x in category.split(';')]
                primary_cat = folder_categories.pop(0)
                if primary_cat not in categories:
                    categories[primary_cat] = {None: []}
                if not folder_categories:
                    categories[primary_cat][None].append(clean_folder_name)
                else:
                    if not '; '.join(folder_categories) in categories[primary_cat]:
                        # noinspection PyTypeChecker
                        categories[primary_cat]['; '.join(folder_categories)] = []
                    # noinspection PyTypeChecker
                    categories[primary_cat]['; '.join(folder_categories)].append(clean_folder_name)
            else:
                # noinspection
                categories[None].append(Path(name).name.strip())

            p = Path(name)
            files[p.name] = [x.name for x in p.glob('**/*') if x.is_file() and not x.name.startswith('.')]

        _ = {}

        for cat in sorted([str(x) for x in categories.keys()]):
            if cat == 'None':
                cat = None
            for subcat in sorted([str(x) for x in categories[cat].keys()]):
                if subcat == 'None':
                    subcat = None
                if cat not in _:
                    _[cat] = {}
                _[cat][subcat] = categories[cat][subcat]

        return _, files
