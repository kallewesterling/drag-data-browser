from .dependencies import *
from .settings import Settings
from .dataframe import *
from .utils import *
from .clippings import *

ARTISTS = re.compile(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]')  # follows wikipedia standard
FOOTNOTES = re.compile(r'\[fn=([^\[]+)\]')


def minify_html(text):
    """ A function that disables minify_html for the development phase """
    return text


# Wipe directories that will be automatically generated
def wipe_temp_dirs(directories=[
    os.path.join(Settings.OUTPUT_DIR, x) for x in
    ['about', 'case-study', 'clustering-v-individual', 'code', 'continuous-performers', 'dataset', 'geo',
     'great-migration', 'network', 'process', 'similar-names']
]):
    for directory in directories:
        wipe_dir(directory, raise_error=False)

wipe_temp_dirs()


# Ensure our output directories exist (since dataset is inside OUTPUT_DIR, we only need to check one)
Path(Settings.DATASET_OUTPUT_DIR).verify_parent()
Path(Settings.DATA_OUTPUT_DIR).verify_parent()
