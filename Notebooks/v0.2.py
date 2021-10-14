#!/usr/bin/env python
# coding: utf-8
# %%
# Imports
from assistant import *
from shutil import copyfile

start = time.time()

# %%
# Settings

PRODUCTION = True
YEAR_RANGE = (1900, 1950)

TITLE = "Gayboys and Playboys"
# SUBTITLE = "U.S. Drag Performers in 1930s Burlesque and Night Clubs"
# SUBTITLE = "Queer World Making By Peripatetic Drag Performers Building Queer Worlds Across U.S. Burlesque and Night Clubs in the 1930s"
SUBTITLE = "Constructing Queer Collectivities in Peripatetic Burlesque and Nightclub Shows in 1930s United States"

BASE_URL = "/docs/"
if PRODUCTION:
    BASE_URL = "/drag-data-browser/"
DATA_SHEET = "https://docs.google.com/spreadsheets/d/1UlpFQ9WWA6_6X-RuMJ3vHdIbyqhCZ1VRYgcQYjXprAg/edit"

ROOT = "/Users/kallewesterling/Repositories/kallewesterling/dissertation/drag-data-browser/"
TEMPLATE_DIR = ROOT + "templates/"

# output directories
OUTPUT_DIR = ROOT + "docs/"
DATASET_OUTPUT_DIR = OUTPUT_DIR + "dataset/"
DATA_OUTPUT_DIR = OUTPUT_DIR + "data/"

DATASET_URL = BASE_URL + "dataset/"
CASE_STUDY_URL = BASE_URL + "case-study/"
DATA_URL = BASE_URL + "data/"

CASE_STUDY_TITLES = {
    1: {
        "title": "Intimate Accoutrements as Somatechnical Network Devices",
        "subtitle": "Through High Heels and Rubber Breasts to the Collective",
        "url": "intimate-accoutrements-as-somatechnical-network-devices",
        "json": DATA_OUTPUT_DIR + "case-study-1.json",
    },
    2: {
        "title": "“An Expanse of Hairy Chest Above a Beaded Brassiere”",
        "subtitle": "Bobby Morris’s Burlesque Drag Striptease",
        "url": "an-expanse-of-hairy-chest-above-a-beaded-brassiere",
        "json": DATA_OUTPUT_DIR + "case-study-2.json",
    },
    3: {
        "title": "Camping in the Clubs and the County Courts",
        "subtitle": "Taming the Wild Gender of the Playboy Revue",
        "url": "camping-in-the-clubs-and-the-county-courts",
        "json": DATA_OUTPUT_DIR + "case-study-3.json",
    },
    4: {
        "title": "“See it—Live it—Dance it”",
        "subtitle": "Peripatetic Queer World-Making in Fay Norman’s Gay Boy Revue",
        "url": "see-it-live-it-dance-it",
        "json": DATA_OUTPUT_DIR + "case-study-4.json",
    },
}

NAVBAR = {
    "width": 280,
    "structure": {
        "Meta": [
            {
                "icon": "case-study",
                "title": "Theorizing the Peripatetic",
                "url": CASE_STUDY_URL + "theorizing-the-peripatetic/",
                "subcategories": []
            }
        ],
        "Case Studies": [
            {
                "icon": "case-study",
                "title": "Intimate Accoutrements as Somatechnical Network Devices",
                "url": CASE_STUDY_URL
                + "intimate-accoutrements-as-somatechnical-network-devices/",
                "subcategories": [],
            },
            {
                "icon": "case-study",
                "title": "“An Expanse of Hairy Chest Above a Beaded Brassiere”",
                "url": CASE_STUDY_URL
                + "an-expanse-of-hairy-chest-above-a-beaded-brassiere/",
                "subcategories": [],
            },
            {
                "icon": "case-study",
                "title": "Camping in the Clubs and the County Courts",
                "url": CASE_STUDY_URL + "camping-in-the-clubs-and-the-county-courts/",
                "subcategories": [],
            },
            {
                "icon": "case-study",
                "title": "“See it—Live it—Dance it”",
                "url": CASE_STUDY_URL + "see-it-live-it-dance-it/",
                "subcategories": [],
            },
        ],
        "Visualizations": [
            {
                "icon": "network",
                "title": "Network",
                "url": BASE_URL + "network/",
                "subcategories": [
                    {
                        "title": "Community Distribution",
                        "url": BASE_URL + "network/community-distribution/",
                    },
                    {
                        "title": "Network Overview",
                        "url": BASE_URL + "network/overview/",
                    },
                ],
            },
            {
                "icon": "migration",
                "title": "Great Migration",
                "url": BASE_URL + "great-migration/",
                "subcategories": [],
            },
            {
                "icon": "speedometer2",
                "title": "Continuous Performers",
                "url": BASE_URL + "continuous-performers/",
                "subcategories": [],
            },
            {
                "icon": "globe",
                "title": "Geodata (alpha)",
                "url": BASE_URL + "geo/",
                "subcategories": [],
            },
            {
                "icon": "process",
                "title": "Research Process",
                "url": BASE_URL + "process/",
                "subcategories": [],
            },
        ],
        "Data": [
            {
                "icon": "dataset",
                "title": "Dataset",
                "url": DATASET_URL + "",
                "subcategories": [
                    {"title": "Performers", "url": DATASET_URL + "performer/"},
                    {"title": "Venues", "url": DATASET_URL + "venue/"},
                    {
                        "title": "Similar name reports",
                        "url": BASE_URL + "similar-names/",
                    },
                ],
            },
            {
                "icon": "clippings",
                "title": "Clippings",
                "url": DATASET_URL + "clippings/",
                "subcategories": [],
            },
        ],
    },
}

continuous_performer_data = {
    "leads": {
        0: "This is the dataset's actual content. Each dot represents each month where the artist selected appears in the dataset.",
        1: "The padding of the dataset here ranges ±1 month, which means that if the selected artist appeared in one month in the dataset, it is assumed that the same artist appeared in the surrounding two months (1 month before and 1 month after the date in the dataset).",
        2: "The padding of the dataset here ranges ±2 months, which means that if the selected artist appeared in one month in the dataset, it is assumed that the same artist appeared in the surrounding four months (2 months before and 2 months after the date in the dataset).",
        3: "The padding of the dataset here ranges ±3 months, which means that if the selected artist appeared in one month in the dataset, it is assumed that the same artist appeared in the surrounding six months (3 months before and 3 months after the date in the dataset).",
        4: "The padding of the dataset here ranges ±4 months, which means that if the selected artist appeared in one month in the dataset, it is assumed that the same artist appeared in the surrounding eight months (4 months before and 4 months after the date in the dataset).",
        5: "The padding of the dataset here ranges ±5 months, which means that if the selected artist appeared in one month in the dataset, it is assumed that the same artist appeared in the surrounding ten months (5 months before and 5 months after the date in the dataset).",
    }
}


# %%
# Ensure our output directories exist (since dataset is inside OUTPUT_DIR, we only need to check one)
Path(DATASET_OUTPUT_DIR).verify_parent()


# %%
# Get our main DataFrame
df = get_basic_df(get_filter=True, year_range=YEAR_RANGE)


# %%
df = df.drop(
    df[df["filter"] == "unsure_exclude"].index
)  # Drop unsure/excluded before node data

# %%
df = df.drop_duplicates(
    subset=["Date", "Performer", "Venue", "City", "State", "Source"]
)  # Drop duplicates based on subset of columns

# %%
# Extract node information
addresses = df.extract_addresses_dict()
revue_comments = df.get_revue_comments_dict()
performer_comments = df.get_performer_comments_dict()
venue_comments = df.get_venue_comments_dict()
city_comments = df.get_city_comments_dict()
# edge_comments = df.get_comments('Edge Comment', 'Source')
legal_names = df.get_comments("Legal name", "Performer")
ages = df.get_comments("Alleged age", "Performer", lambda x: int(float(x)))
birth_years = df.get_comments(
    "Assumed birth year", "Performer", lambda x: int(float(x))
)
eima_links = df.get_comments("EIMA", "Source")
newspaper_links = df.get_comments("Newspapers.com", "Source")

# Extract edge booleans
blackface_performers = df.get_comments("Blackface", "Performer", lambda x: bool(x))
sepia_performers = df.get_comments("Sepia", "Performer", lambda x: bool(x))
fan_dance_performers = df.get_comments(
    "Fan dancer/Sally Rand", "Performer", lambda x: bool(x)
)
exotic_dancers = df.get_comments(
    "Exotic/erotic/oriental dancer/Gypsy", "Performer", lambda x: bool(x)
)
has_image = df.get_comments("Has image", "Performer", lambda x: bool(x))


# %%
# Drop filtered data
df = df.drop(df[df["filter"] != False].index)


# %%
# Set up helpful columns
df["has_unique_venue"] = df.apply(
    lambda row: row["Unique venue"] != "" and not row["Unique venue"].startswith("—"),
    axis=1,
)
df["has_performer"] = df.apply(lambda row: row.Performer != "", axis=1)
df["has_city"] = df.apply(lambda row: row.City != "" and row.City != "?", axis=1)
df["has_revue"] = df.apply(
    lambda row: row.Revue != "" and not row.Revue.startswith("("), axis=1
)

# %%
# Drop columns
df = df.drop_columns(
    [
        "Category",
        "Newspapers.com",
        "Blackface",
        "Sepia",
        "Fan dancer/Sally Rand",
        "Exotic/erotic/oriental dancer/Gypsy",
        "Has image",
        "Legal name",
        "Alleged age",
        "Assumed birth year",
        "Search (fulton)",
        "Imported from former archive",
        "Edge Comment",
        "Comment on node: performer",
        "Comment on node: venue",
        "Comment on node: city",
        "Comment on edge: revue",
        "Exclude from visualization",
        "Address",
        "Unsure whether drag artist",
        "filter",
    ]
)

# %%
columns, rows = df.shape
print(f"Data has {columns} columns organized in {rows} rows.")


# %%

# %%
# Set up jinja "constants"
ALL_YEARS = list(range(*YEAR_RANGE))
ALL_PERFORMERS = df.slugify_column("Performer")
ALL_VENUES = df.slugify_column("Unique venue")
ALL_CITIES = df.slugify_column("City")

# %%

# %%
e = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# Add the settings to globals
e.globals["BASE_URL"] = BASE_URL
e.globals["DATASET_URL"] = DATASET_URL
e.globals["CASE_STUDY_URL"] = CASE_STUDY_URL
e.globals["DATA_URL"] = DATA_URL
e.globals["DATA_SHEET"] = DATA_SHEET
e.globals["SITE_TITLE"] = TITLE
e.globals["SITE_SUBTITLE"] = SUBTITLE
e.globals["NAVBAR"] = NAVBAR

# Add jinja functions to globals
get_venue_slug = lambda venue: ALL_VENUES[venue]
get_performer_slug = lambda performer: ALL_PERFORMERS[performer]
escape_quote = lambda string: string.replace('"', '\\"')
e.globals["slugify"] = slugify
e.globals["escape"] = escape_quote
e.globals["str"] = str
e.globals["get_venue_slug"] = get_venue_slug
e.globals["get_performer_slug"] = get_performer_slug

# Add jinja "constants" to globals
e.globals["ALL_YEARS"] = ALL_YEARS
e.globals["ALL_PERFORMERS"] = ALL_PERFORMERS
e.globals["ALL_VENUES"] = ALL_VENUES
e.globals["ALL_CITIES"] = ALL_CITIES

# Add comments to jinja globals
e.globals["PERFORMER_COMMENTS"] = reverse_comment_dict(performer_comments)
e.globals["VENUE_COMMENTS"] = reverse_comment_dict(venue_comments)
e.globals["CITY_COMMENTS"] = reverse_comment_dict(city_comments)

# Add all newspapers.com and EIMA ids to the globals
e.globals["NEWSPAPERS_LINKS"] = newspaper_links
e.globals["EIMA_LINKS"] = eima_links

# Adding random DF connections to globals
e.globals["CALENDAR"] = df.make_calendar()
e.globals["NAME_MAPPING"] = df.get_name_mapping()

# Set up PERFORMER_CLIPPINGS jinja global
e.globals["PERFORMER_CLIPPINGS"] = make_performer_clippings([x for x in ALL_PERFORMERS])
e.globals["PERFORMER_CLIPPINGS"] = {
    k: v for k, v in e.globals["PERFORMER_CLIPPINGS"].items() if v
}


# %%
clippings = Clippings()
e.globals["ALL_CLIPPINGS"] = clippings.ALL_CLIPPINGS
e.globals["ALL_CLIPPINGS_FILES"] = clippings.ALL_CLIPPINGS_FILES


# %%

# %%

# %%
# Footnote related functions

footnote_dir = Path(DATA_OUTPUT_DIR + "case-study-footnotes.json").read_json()


def lookup_footnote(footnote, footnote_dir=footnote_dir, get_field="fullReference"):
    footnote_looked_up = footnote_dir.get(footnote, {})
    if footnote_looked_up.get(get_field):
        return footnote_looked_up.get(get_field)
    else:
        return f"Error: {get_field} for footnote {footnote} could not be found."


# %%
# Copy the `drag-network` and `drag-geo` repositories into their correct directories.

# Copy drag-network into the html here too

if Path("../drag-network").exists():
    copy_and_overwrite("../drag-network", OUTPUT_DIR + "network")
    Path(OUTPUT_DIR + "network/index.html").unlink()

    for file in [x for x in Path("../drag-network/data").glob("*.json")]:
        copyfile(file, f"../docs/data/{file.name}")
    for file in [
        x
        for x in Path(
            "../drag-network/data/individual-networks/v1-co-occurrence-grouped-by-14-days-no-unnamed-performers/"
        ).glob("*.json")
    ]:
        copyfile(file, f"../docs/data/individual-networks/{file.name}")
else:
    print(
        "Warning: add `drag-network` repository as a submodule before running this script."
    )
    print("git submodule add https://www.github.com/kallewesterling/drag-network")


# Copy drag-geo into the html here too

if Path("../drag-geo").exists():
    copy_and_overwrite("../drag-geo", OUTPUT_DIR + "geo")
    Path(OUTPUT_DIR + "geo/index.html").unlink()

    for file in [
        x
        for x in Path("../drag-geo/data").glob("*")
        if not "co-occurrence" in x.name and not x.name.startswith(".")
    ]:
        print(file)
        copyfile(file, f"../docs/data/{file.name}")
else:
    print(
        "Warning: add `drag-geo` repository as a submodule before running this script."
    )
    print("git submodule add https://www.github.com/kallewesterling/drag-geo")


# %%
# Set up similar_names_data from the JSON files with the reports


def collect_similar_names(data):
    similar_names = []
    collected = []
    for x, y, z, aa, bb in data:
        if not (x, y) in collected and not (y, x) in collected:
            collected.append((x, y))
            similar_names.append((x, y, z, aa, bb))
    return similar_names


v1_similar_names = Path(DATA_OUTPUT_DIR + "v1-report-similar-names.json").read_json()
v1_similar_names = collect_similar_names(v1_similar_names)

live_similar_names = Path(
    DATA_OUTPUT_DIR + "live-report-similar-names.json"
).read_json()
live_similar_names = collect_similar_names(live_similar_names)

similar_names_data = {
    "v1": [
        (x, y, round((z * 100), 2), nb1, nb2) for x, y, z, nb1, nb2 in v1_similar_names
    ],
    "live": [
        (x, y, round((z * 100), 2), nb1, nb2)
        for x, y, z, nb1, nb2 in live_similar_names
    ],
}


# %%
# Write performers
from collections import OrderedDict

def get_performer_data(performer, row, key=None):
    full_venues = list(
        set(
            venue
            for venue in row["Unique venue"]
            if venue and not venue.startswith("—")
        )
    )
    full_venues = {venue: ALL_VENUES[venue] for venue in full_venues}
    full_venues = OrderedDict(sorted(full_venues.items()))

    cities = sorted(list(set(city for city in row["City"] if city)))
    years_active = sorted(list(set(date.year for date in pd.to_datetime(row["Date"]))))

    next_performer = keyshift(ALL_PERFORMERS, performer, +1)
    prev_performer = keyshift(ALL_PERFORMERS, performer, -1)
    if next_performer:
        next_performer = {
            "label": next_performer,
            "url": DATASET_URL + "performer/" + ALL_PERFORMERS[next_performer],
        }
    if prev_performer:
        prev_performer = {
            "label": prev_performer,
            "url": DATASET_URL + "performer/" + ALL_PERFORMERS[prev_performer],
        }

    data = {
        "name": performer,
        "node_id": slugify_node(performer),
        "years_active": years_active,
        "full_venues": full_venues,
        "cities": cities,
        "in_blackface": blackface_performers.get(performer, {}),
        "sepia_performer": sepia_performers.get(performer, {}),
        "fan_dancer": fan_dance_performers.get(performer, {}),
        "exotic_dancer": exotic_dancers.get(performer, {}),
        "images": has_image.get(performer, {}),
        "comments": e.globals["PERFORMER_COMMENTS"].get(performer, {}),
        "legal_name": legal_names.get(performer, {}),
        "age": ages.get(performer, {}),
        "birth_year": birth_years.get(performer, {}),
        "relative": {"next": next_performer, "prev": prev_performer},
    }

    if key:
        return data[key]

    return data


performers_active_dates_overview = {
    performer: get_performer_data(performer, row, "years_active")
    for performer, row in df[df["has_performer"]].groupby(["Performer"])
}
PERFORMER_RANGE = (
    min(itertools.chain.from_iterable(performers_active_dates_overview.values())),
    max(itertools.chain.from_iterable(performers_active_dates_overview.values())),
)

data = {
    "performers_active_dates_overview": performers_active_dates_overview,
    "performer_years_range": [x for x in range(*PERFORMER_RANGE)],
}
write_html(
    e,
    "dataset/performer-list.html",
    data=data,
    path=("performer",),
    dataset=True,
    verbose=False,
)

counter = [
    write_html(
        e,
        "dataset/performer.html",
        data=get_performer_data(performer, row),
        path=("performer", ALL_PERFORMERS[performer]),
        dataset=True,
        verbose=False,
    )
    for performer, row in df[df["has_performer"]].groupby(["Performer"])
]
print(
    f"{len(counter)} performer files written. ({PERFORMER_RANGE[0]}-{PERFORMER_RANGE[1]})"
)


# %%
# Write venues


def get_venue_data(venue, row, key=None):
    associated_performers = list(set(x for x in row["Performer"] if x))
    associated_performers = {x: ALL_PERFORMERS[x] for x in associated_performers}
    associated_performers = OrderedDict(sorted(associated_performers.items()))

    years_active = sorted(list(set(x.year for x in pd.to_datetime(row["Date"]))))

    next_venue = keyshift(ALL_VENUES, venue, +1)
    prev_venue = keyshift(ALL_VENUES, venue, -1)
    if next_venue:
        next_venue = {
            "label": next_venue,
            "url": DATASET_URL + "venue/" + ALL_VENUES[next_venue],
        }
    if prev_venue:
        prev_venue = {
            "label": prev_venue,
            "url": DATASET_URL + "venue/" + ALL_VENUES[prev_venue],
        }

    data = {
        "name": venue,
        "years_active": years_active,
        "associated_performers": associated_performers,
        "addresses": addresses.get(venue, {}),
        "comments": venue_comments.get(venue, {}),
        "relative": {
            "next": next_venue,
            "prev": prev_venue,
        },
    }

    if key:
        return data[key]
    return data


venues_active_dates_overview = {
    venue: get_venue_data(venue, row, "years_active")
    for venue, row in df[df["has_unique_venue"]].groupby(["Unique venue"])
}
VENUE_RANGE = (
    min(itertools.chain.from_iterable(venues_active_dates_overview.values())),
    max(itertools.chain.from_iterable(venues_active_dates_overview.values())),
)

counter = [
    write_html(
        e,
        "dataset/venue.html",
        data=get_venue_data(venue, row),
        path=("venue", ALL_VENUES[venue]),
        dataset=True,
        verbose=False,
    )
    for venue, row in df[df["has_unique_venue"]].groupby(["Unique venue"])
]
print(f"{len(counter)} venue files written. ({VENUE_RANGE[0]}-{VENUE_RANGE[1]})")

data = {
    "venues_active_dates_overview": venues_active_dates_overview,
    "venues_years_range": [x for x in range(*VENUE_RANGE)],
}
write_html(
    e,
    "dataset/venue-list.html",
    data=data,
    path=("venue",),
    dataset=True,
    verbose=False,
)

# %%
# Write JSON data files required for dataset/performer and dataset/venue

Path(DATA_OUTPUT_DIR + "years-active.json").write_json(performers_active_dates_overview)
Path(DATA_OUTPUT_DIR + "years-active-venues.json").write_json(
    venues_active_dates_overview
)
Path(DATA_OUTPUT_DIR + "performer-slugs.json").write_json(
    {v: k for k, v in ALL_PERFORMERS.items()}
)
Path(DATA_OUTPUT_DIR + "venue-slugs.json").write_json(
    {v: k for k, v in ALL_VENUES.items()}
)


# %%
# Write case studies


def get_case_study_data(number=None, CASE_STUDY_TITLES=CASE_STUDY_TITLES):
    try:
        with open(CASE_STUDY_TITLES[number]["json"], "r") as f:
            chapter = json.loads(f.read())
    except:
        print("file not found", CASE_STUDY_TITLES[number]["json"])
        chapter = {}

    sections = []
    for section in chapter.get("sections", []):
        slugified = slugify(section["title"])
        sections.append((section["title"], slugified))
        section["slug"] = slugified
        for ix, paragraph in enumerate(section["paragraphs"]):
            if paragraph.endswith(".png"):
                section["paragraphs"][
                    ix
                ] = f'<img src="{BASE_URL}data/case-study-{number}/{section["paragraphs"][ix]}" class="border shadow-sm rounded-3" />'
            if paragraph.startswith("<"):
                pass
            else:
                section["paragraphs"][ix] = f"<p>{ paragraph }</p>"

    all_footnotes = []
    for section in chapter.get("sections", []):
        for ix, para in enumerate(section["paragraphs"]):
            for found_artist in ARTISTS.findall(para):
                try:
                    performer_slug = get_performer_slug(found_artist)
                except:
                    performer_slug = None

                if performer_slug:
                    section["paragraphs"][ix] = para.replace(
                        f"[[{found_artist}]]",
                        f'<a href="{ DATASET_URL }performer/{performer_slug}">{found_artist}</a>',
                    )
            for footnote in FOOTNOTES.findall(para):
                orig_footnote = footnote
                if footnote.startswith("{") and footnote.endswith("}"):
                    footnote = lookup_footnote(footnote[1:-1])
                all_footnotes.append(footnote)
                section["paragraphs"][ix] = section["paragraphs"][ix].replace(
                    f"[fn={orig_footnote}]",
                    f'<sup><a id="inlineFootnote{len(all_footnotes)}" href="#fn{len(all_footnotes)}" class="text-decoration-none text-secondary">{len(all_footnotes)}</a></sup>',
                )

    case_study_data = {
        "title": CASE_STUDY_TITLES[number]["title"],
        "subtitle": CASE_STUDY_TITLES[number]["subtitle"],
        "sections": sections,
        "chapter": chapter,
        "url": CASE_STUDY_TITLES[number]["url"],
        "footnotes": {
            counter: footnote for counter, footnote in enumerate(all_footnotes, start=1)
        },
    }

    if not case_study_data["chapter"].get("abstract"):
        soup = BeautifulSoup(case_study_data["chapter"]["sections"][0]["paragraphs"][0])
        text = []
        for x in soup.html.body.p.children:
            if isinstance(x, bs4.element.NavigableString):
                text.append(x.strip())
        case_study_data["chapter"]["abstract"] = " ".join(text)

    return case_study_data


# %%
meta_case_study_data = {
    "title": "Theorizing the Peripatetic",
    "subtitle": "(Re)Constructing a Network of Itinerant Queer Nightlife Performers in the 1930s Through Data-Assisted Historiography",
    "sections": [(x, slugify(x)) for x in ['Section Title']],
    "abstract": "",
    "url": "theorizing-the-peripatetic",
    "footnotes": {},
    "chapter": {
        "unfinished": True,
        "title": "XXXX",
        "subtitle": "XXXX",
        "slug": slugify("Section Title"),
        "sections": [
            {
                "title": "XXXX",
                "subtitle": "",
                "paragraphs": [
                    "<p>Paragraph 1</p>"
                ]
            }
        ]
    }
}

# %%
# Case studies
[
    write_html(
        e,
        "case-study/case-study.html",
        data=get_case_study_data(number),
        path=("case-study", CASE_STUDY_TITLES[number]["url"]),
    )
    for number in [4, 3, 1, 2]
]
write_html(
    e,
    "case-study/index.html",
    data={"case_studies": {k: get_case_study_data(k) for k in [1, 2, 3, 4]}},
    path=("case-study",),
)
write_html(e, "case-study/meta.html", data=meta_case_study_data, path=("case-study", "theorizing-the-peripatetic",))

# Similar name report
write_html(e, "similar-names.html", data=similar_names_data, path=("similar-names",))

# Files with no extra data (only template)
write_html(e, "home.html", path=("",))
write_html(e, "about.html", path=("about",))
write_html(e, "dataset/home.html", path=("",), dataset=True)
write_html(e, "dataset/clippings.html", path=("clippings",), dataset=True)
write_html(e, "dataset/calendar.html", path=("calendar",), dataset=True)
write_html(e, "code/index.html", path=("code",))
write_html(e, "code/continuous-performers.html", path=("code", "continuous-performers"))

# Write visualizations
write_html(
    e,
    "viz/continuous-performers.html",
    data=continuous_performer_data,
    path=("continuous-performers",),
)
write_html(e, "viz/network.html", path=("network",))
write_html(
    e,
    "viz/network-community-distribution.html",
    path=("network", "community-distribution"),
)
write_html(e, "viz/network-overview.html", path=("network", "overview"))
write_html(e, "viz/geo.html", path=("geo",))
write_html(e, "viz/process.html", path=("process",))
write_html(e, "viz/sankey.html", path=("great-migration",))


# %%
end = time.time()
print(f'Done at {dt.now().strftime("%H:%M:%S")} - after {round(end-start, 2)} seconds.')


# %%

# %%

# %%

# %%

# %%

# %%

# %%

# %%

# %%
