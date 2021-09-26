from pathlib import Path
from datetime import datetime as dt
import glob
import re


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
    
    def get_comment(name):
        if FILE_COMMENT.search(name):
            return FILE_COMMENT.search(name).groups()[1]
        return ''

    ARCHIVE_PNG_PATHS = [x.lower() for x in glob.glob('/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/**/*.png', recursive=True)]
    ARCHIVE_FOLDERS = [x.lower() for x in glob.glob('/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/*')]
    FILE_COMMENT = re.compile(r'(.*) ?\[(.*)\]')

    for performer in list_of_performers:
        found = False

        if not performer:
            continue

        names = performer.split(' ')
        if len(names) == 3:
            if names[1] == 'La' or names[1] == 'Le' or names[1] == 'De' or names[1] == 'Del' or names[1] == 'St.' or names[1] == 'Van' or names[1] == 'Val' or names[1] == 'the':
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
            search = [x for x in ARCHIVE_FOLDERS if (f'{names[1]}, {names[0]}' in x or f'{names[0]} {names[1]}' in x) and 'performer' in get_comment(x)]
            if len(search) == 1:
                found = search[0]
            else:
                pass # print(f'{names[1]}, {names[0]}', search)
                
        elif len(names) == 1:
            search = [x for x in ARCHIVE_FOLDERS if Path(x).stem.startswith(names[0])]
            if len(search) == 1:
                found = search[0]
            else:
                pass # print(names, search)
        elif len(names) == 3:
            search = [x for x in ARCHIVE_FOLDERS if (f'{names[2]}, {names[0]} {names[1]}' in x or f'{names[0]} {names[1]}' in x) and 'performer' in get_comment(x)]
            if len(search) == 1:
                found = search[0]
            else:
                pass # print(f'{names[2]}, {names[0]} {names[1]}', search)

        if found:
            if not 'performer' in get_comment(Path(found).name) and not 'producer' in get_comment(Path(found).name):
                print(f'Warning: Found matching clippings folder with wrong name, so decoupling: {performer} ≠ {Path(found).name}')
                found = False # if not a performer or producer
        else:
            print(f'Warning: {performer} does not exist in clippings')
            found = ''
            
        _[performer] = found
    
    return _


class Clippings():
    EXPIRY_DAYS = 7
    
    CACHE_ALL_CLIPPINGS = '.clippings_cache/CACHE_ALL_CLIPPINGS.json'
    CACHE_ALL_CLIPPINGS_FILES = '.clippings_cache/CACHE_ALL_CLIPPINGS_FILES.json'
    CACHE_ALL_CLIPPINGS = Path(CACHE_ALL_CLIPPINGS)
    CACHE_ALL_CLIPPINGS.verify_parent()
    CACHE_ALL_CLIPPINGS_FILES = Path(CACHE_ALL_CLIPPINGS_FILES)
    CACHE_ALL_CLIPPINGS_FILES.verify_parent()
    
    def __init__(self):
        if not self.cache_exists() or self.cache_expired():
            ALL_CLIPPINGS, ALL_CLIPPINGS_FILES = self.make()
            self.CACHE_ALL_CLIPPINGS.write_json(ALL_CLIPPINGS)
            self.CACHE_ALL_CLIPPINGS_FILES.write_json(ALL_CLIPPINGS_FILES)
        self.ALL_CLIPPINGS = self.CACHE_ALL_CLIPPINGS.read_json()
        self.ALL_CLIPPINGS_FILES = self.CACHE_ALL_CLIPPINGS_FILES.read_json()
    
    def cache_exists(self):
        return self.CACHE_ALL_CLIPPINGS.exists() and self.CACHE_ALL_CLIPPINGS_FILES.exists()
    
    def cache_expired(self, days=EXPIRY_DAYS):
        ts = self.CACHE_ALL_CLIPPINGS.stat().st_mtime
        past_date = dt.fromtimestamp(ts)
        difference = dt.utcnow() - past_date
        return difference.days > days
    
    def make(self):
        import glob

        try:
            from IPython.display import clear_output
            ipython = True
        except:
            ipython = False
        files = {}
        ARCHIVE_FOLDERS = [x for x in glob.glob('/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/*')]
        FILE_COMMENT = re.compile(r'(.*) ?\[(.*)\]')
        categories = {None: {None: []}}
        for folder_count, name in enumerate(ARCHIVE_FOLDERS):
            if ipython:
                print(f'{folder_count}/{len(ARCHIVE_FOLDERS)}: {name}')
                clear_output(wait=True)
            if FILE_COMMENT.search(name):
                folder, category = FILE_COMMENT.search(name).groups()
                clean_folder_name = Path(folder).name.strip()
                print(clean_folder_name)
                folder_categories = [x.strip() for x in category.split(';')]
                primary_cat = folder_categories.pop(0)
                if not primary_cat in categories:
                    categories[primary_cat] = {None: []}
                if not folder_categories:
                    categories[primary_cat][None].append(clean_folder_name)
                else:
                    if not '; '.join(folder_categories) in categories[primary_cat]:
                        categories[primary_cat]['; '.join(folder_categories)] = []
                    categories[primary_cat]['; '.join(folder_categories)].append(clean_folder_name)
            else:
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
                if not cat in _:
                    _[cat] = {}
                _[cat][subcat] = categories[cat][subcat]

        return _, files