from .dependencies import Path, Environment, FileSystemLoader, slugify, os

PRODUCTION = True
YEAR_RANGE = (1900, 1950)

TITLE = 'Gayboys and Playboys'
SUBTITLE = 'Constructing Queer Collectivities in Peripatetic Burlesque and Nightclub Shows in 1930s United States'
# SUBTITLE = 'U.S. Drag Performers in 1930s Burlesque and Night Clubs'
# SUBTITLE = 'Queer World Making By Peripatetic Drag Performers Building Queer Worlds Across U.S. Burlesque and
#             Night Clubs in the 1930s'

BASE_URL = '/docs/'
if PRODUCTION:
    BASE_URL = '/drag-data-browser/'

# Foundational directories
ROOT = [parent for parent in Path(__file__).parents
        if str(parent).endswith('drag-data-browser')][0]
TEMPLATE_DIR = os.path.join(ROOT, 'templates')

# Google stuff
gdoc = '1UlpFQ9WWA6_6X-RuMJ3vHdIbyqhCZ1VRYgcQYjXprAg'
gdoc_e = '2PACX-1vT0E0Y7txIa2pfBuusA1cd8X5OVhQ_D0qZC8D40KhTU3xB7McsPR2kuB7GH6ncmNT3nfjEYGbscOPp0'
gid = '254069133'
DATA_SOURCE = f'https://docs.google.com/spreadsheets/d/e/{gdoc_e}/pub?gid={gid}&single=true&output=csv'
DATA_SHEET = 'https://docs.google.com/spreadsheets/d/{gdoc}/edit'

# output directories
OUTPUT_DIR = os.path.join(ROOT, 'docs')
DATASET_OUTPUT_DIR = os.path.join(OUTPUT_DIR, 'dataset')
DATA_OUTPUT_DIR = os.path.join(OUTPUT_DIR, 'data')

# url directories
DATASET_URL = os.path.join(BASE_URL, 'dataset')
CASE_STUDY_URL = os.path.join(BASE_URL, 'case-study')
DATA_URL = os.path.join(BASE_URL, 'data')

CASE_STUDY_TITLES = {
    1: {
        'title': 'Intimate Accoutrements as Somatechnical Network Devices',
        'subtitle': 'Through High Heels and Rubber Breasts to the Collective',
        'url': 'intimate-accoutrements-as-somatechnical-network-devices',
        'json': os.path.join(DATA_OUTPUT_DIR, 'case-study-1.json'),
    },
    2: {
        'title': '“An Expanse of Hairy Chest Above a Beaded Brassiere”',
        'subtitle': 'Bobby Morris’s Burlesque Drag Striptease',
        'url': 'an-expanse-of-hairy-chest-above-a-beaded-brassiere',
        'json': os.path.join(DATA_OUTPUT_DIR, 'case-study-2.json'),
    },
    3: {
        'title': 'Camping in the Clubs and the County Courts',
        'subtitle': 'Taming the Wild Gender of the Playboy Revue',
        'url': 'camping-in-the-clubs-and-the-county-courts',
        'json': os.path.join(DATA_OUTPUT_DIR, 'case-study-3.json'),
    },
    4: {
        'title': '“See it—Live it—Dance it”',
        'subtitle': 'Peripatetic Queer World-Making in Fay Norman’s Gay Boy Revue',
        'url': 'see-it-live-it-dance-it',
        'json': os.path.join(DATA_OUTPUT_DIR, 'case-study-4.json'),
    },
}

NAVBAR = {
    'width': 280,
    'structure': {
        'Meta': [
            {
                'icon': 'case-study',
                'title': 'Theorizing the Peripatetic',
                'url': os.path.join(CASE_STUDY_URL, 'theorizing-the-peripatetic/'),
                'subcategories': []
            }
        ],
        'Case Studies': [
            {
                'icon': 'case-study',
                'title': 'Intimate Accoutrements as Somatechnical Network Devices',
                'url': os.path.join(CASE_STUDY_URL, 'intimate-accoutrements-as-somatechnical-network-devices'),
                'subcategories': [],
            },
            {
                'icon': 'case-study',
                'title': '“An Expanse of Hairy Chest Above a Beaded Brassiere”',
                'url': os.path.join(CASE_STUDY_URL, 'an-expanse-of-hairy-chest-above-a-beaded-brassiere'),
                'subcategories': [],
            },
            {
                'icon': 'case-study',
                'title': 'Camping in the Clubs and the County Courts',
                'url': os.path.join(CASE_STUDY_URL, 'camping-in-the-clubs-and-the-county-courts'),
                'subcategories': [],
            },
            {
                'icon': 'case-study',
                'title': '“See it—Live it—Dance it”',
                'url': os.path.join(CASE_STUDY_URL, 'see-it-live-it-dance-it'),
                'subcategories': [],
            },
        ],
        'Visualizations': [
            {
                'icon': 'network',
                'title': 'Network',
                'url': os.path.join(BASE_URL, 'network'),
                'subcategories': [
                    {
                        'title': 'Community Distribution',
                        'url': os.path.join(BASE_URL, 'network/community-distribution'''),
                    },
                    {
                        'title': 'Network Overview',
                        'url': os.path.join(BASE_URL, 'network/overview'),
                    },
                ],
            },
            {
                'icon': 'migration',
                'title': 'Great Migration',
                'url': os.path.join(BASE_URL, 'great-migration'),
                'subcategories': [],
            },
            {
                'icon': 'speedometer2',
                'title': 'Continuous Performers',
                'url': os.path.join(BASE_URL, 'continuous-performers'),
                'subcategories': [],
            },
            {
                'icon': 'globe',
                'title': 'Geodata (alpha)',
                'url': os.path.join(BASE_URL, 'geo'),
                'subcategories': [],
            },
            {
                'icon': 'process',
                'title': 'Research Process',
                'url': os.path.join(BASE_URL, 'process'),
                'subcategories': [],
            },
        ],
        'Data': [
            {
                'icon': 'dataset',
                'title': 'Dataset',
                'url': DATASET_URL,
                'subcategories': [
                    {
                        'title': 'Performers',
                        'url': os.path.join(DATASET_URL, 'performer')
                    },
                    {
                        'title': 'Venues',
                        'url': os.path.join(DATASET_URL, 'venue')
                    },
                    {
                        'title': 'Similar name reports',
                        'url': os.path.join(BASE_URL, 'similar-names')
                    },
                ],
            },
            {
                'icon': 'clippings',
                'title': 'Clippings',
                'url': os.path.join(DATASET_URL, 'clippings'),
                'subcategories': [],
            },
        ],
    },
}

continuous_performer_data = {
    'leads': {
        0: 'This is the dataset\'s actual content. Each dot represents each month where the artist selected appears in '
           'the dataset.',
        1: 'The padding of the dataset here ranges ±1 month, which means that if the selected artist appeared in one '
           'month in the dataset, it is assumed that the same artist appeared in the surrounding two months (1 month '
           'before and 1 month after the date in the dataset).',
        2: 'The padding of the dataset here ranges ±2 months, which means that if the selected artist appeared in one '
           'month in the dataset, it is assumed that the same artist appeared in the surrounding four months (2 '
           'months before and 2 months after the date in the dataset).',
        3: 'The padding of the dataset here ranges ±3 months, which means that if the selected artist appeared in one '
           'month in the dataset, it is assumed that the same artist appeared in the surrounding six months (3 months '
           'before and 3 months after the date in the dataset).',
        4: 'The padding of the dataset here ranges ±4 months, which means that if the selected artist appeared in one '
           'month in the dataset, it is assumed that the same artist appeared in the surrounding eight months (4 '
           'months before and 4 months after the date in the dataset).',
        5: 'The padding of the dataset here ranges ±5 months, which means that if the selected artist appeared in one '
           'month in the dataset, it is assumed that the same artist appeared in the surrounding ten months (5 months '
           'before and 5 months after the date in the dataset).',
    }
}


class Settings(object):
    PRODUCTION = PRODUCTION
    YEAR_RANGE = YEAR_RANGE
    TITLE = TITLE
    SUBTITLE = SUBTITLE
    BASE_URL = BASE_URL
    DATASET_URL = DATASET_URL
    ROOT = ROOT
    DATA_SOURCE = DATA_SOURCE
    TEMPLATE_DIR = TEMPLATE_DIR
    OUTPUT_DIR = OUTPUT_DIR
    DATASET_OUTPUT_DIR = DATASET_OUTPUT_DIR
    DATA_OUTPUT_DIR = DATA_OUTPUT_DIR
    DATASET_URL = DATASET_URL
    CASE_STUDY_URL = CASE_STUDY_URL
    DATA_URL = DATA_URL
    CASE_STUDY_TITLES = CASE_STUDY_TITLES
    NAVBAR = NAVBAR
    continuous_performer_data = continuous_performer_data
    e = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


Settings.e.globals['BASE_URL'] = BASE_URL
Settings.e.globals['DATASET_URL'] = DATASET_URL
Settings.e.globals['CASE_STUDY_URL'] = CASE_STUDY_URL
Settings.e.globals['DATA_URL'] = DATA_URL
Settings.e.globals['DATA_SHEET'] = DATA_SHEET
Settings.e.globals['SITE_TITLE'] = TITLE
Settings.e.globals['SITE_SUBTITLE'] = SUBTITLE
Settings.e.globals['NAVBAR'] = NAVBAR
Settings.e.globals['slugify'] = slugify
Settings.e.globals['escape'] = lambda string: string.replace('"', '\\"')
Settings.e.globals['str'] = str

print(f'Base URL set to {BASE_URL}')
