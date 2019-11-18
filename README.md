### Planet Generator

![Site preview](http://stuff.karantza.org/planets/Trekia.png)

This is a small javascript library designed to output random (imaginary) planets. The names are generated following some arbitrary rules I made up. Composition, densities, albedo, etc are calculated realistically based on some randomly-chosen initial constraints. Populations are similarly randomly chosen.

Note: while the drawing function works on any size canvas, it starts to look kind of stupid once it gets past 1000px or so. The craters, ring widths, etc are all in pixels so as the planet gets bigger, they look dinkier. This is a known issue.

This library can be seen in use here: http://stuff.karantza.org/planets/demo/
