from pathlib import Path
import re
from tqdm import tqdm
import os, json


POTENTIAL_PATHS = [
    "/Users/kallewesterling/Desktop/",
    "/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- My own clippings and photos/",
    "/Volumes/GoogleDrive/My Drive/Ongoing Projects/Dissertation - Archive/- newspapers.com",
    "/Volumes/External",
]

POTENTIAL_FILE_ENDINGS = [".png"]

NEWSPAPER_ID = re.compile(r"(\d{8,9})")
newspaper_id_files = {}
found_in_dirs = []

for PATH in POTENTIAL_PATHS:
    print("searching in", PATH)

    for subdir, dirs, files in os.walk(PATH):
        for file in files:
            filepath = subdir + os.sep + file

            if "." + file.split(".")[-1] in POTENTIAL_FILE_ENDINGS:
                newspaper_id = None
                has_newspaper_id = NEWSPAPER_ID.search(str(file))

                if has_newspaper_id:
                    newspaper_id = has_newspaper_id.groups()[0]

                if newspaper_id and not newspaper_id in newspaper_id_files:
                    newspaper_id_files[newspaper_id] = []

                if newspaper_id:
                    newspaper_id_files[newspaper_id].append(filepath)
                    found_in_dirs.append(subdir)
                    found_in_dirs = list(set(found_in_dirs))

from pprint import pprint

# pprint(newspaper_id_files)
pprint(found_in_dirs)
