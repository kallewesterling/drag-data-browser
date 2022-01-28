# Gay Boy and Playboy Revues

**This is the digital companion to [my](https://www.westerling.nu) dissertation project, Gay Boy and Playboy Revues: Constructing U.S. Queer Collectivities in Networks of Peripatetic Burlesque and Nightclub Drag Performers, 1933–1939.”**

The idea was originally to build the companion using the software Scalar, but as the project became more advanced, it included visualizations and data analysis that would not easily be able to fit the affordances by Scalar.

Due to the shortcomings of existing tools and the non-existence of alternatives, I decided to develop my own. The result—an exploratory and playful tool—is intended to encourage new questions, deepen our field of inquiry, and allow for better access to the archival material itself.

My hope is that the technology can make the research project accessible to audiences outside the traditional boundaries of academia. In all, the dissertation project is situated in the intersection of Public and Digital Humanities, Theatre and Performance Studies, and Queer Studies.

The digital component you find here, built by the researcher, shows some visualizations of the dataset that was built to support the arguments made in the dissertation. Since the data is live and continuously built out, you will find more visualizations and explanations of the data [on Observable](https://observablehq.com/@kallewesterling). The dataset exists [on Figshare](https://doi.org/10.6084/m9.figshare.19078235.v1).

## Accessing the Site

This file contains one directory, `docs` which can be served as a static website.

An easy way of doing so is to “serve” the site using Python of minimum version 3.0.

Start by cloning the repository (or unzipping the `.zip` file if you have access to a `.zip file`):

```sh
$ git clone https://github.com/kallewesterling/drag-data-browser
```

Enter the correct directory:

```sh
$ cd drag-data-browser
```

Check out the particular branch (if you have access to a `.zip` file, you do not need to follow this step):

```sh
$ git checkout depositing-docs
```

Then, use Python’s convenient command-line [`http.server` command](https://docs.python.org/3/library/http.server.html):

```sh
$ python -m http.server
```

Now, you should be able to use an web browser (preferably Google Chrome) to navigate to: http://localhost:8000/docs, on your local machine, to explore the data.

## About the Site

When you navigate around this site, you will find that it allows you to move beyond the particular focus on the social organization in a particular city or in cities in general, and to a more general knowledge and description of what the culture of drag looked like across the United States in the 1930s.

This methodology behind the digital component can been described as _data-assisted historiography_, where a “birds-eye view” analysis makes clear the necessity of other more in-depth studies of parts of the historiographic field outlined.

In the dissertation’s last chapter, I contextualize and clarify the need for the other chapters by way of the birds-eye view of the digital component’s network visualization. I also argue against the idea that the digital component, especially the network visualization, provides an “objective truth,” or way to access “reality” through the archival material. Instead, I provide a deep contextualization of the construction of the dataset (and what it leaves out), a description of the algorithms and ideologies that shape the data, and how the network visualization works. The visualization itself, with its interactive elements—buttons, switches, and sliders—is intended to resist ideas of sleekness and opaqueness, which are normally valued in interfaces. The network, then, presents a playful attitude towards fragmented data and its meaning for speculative historiography.
