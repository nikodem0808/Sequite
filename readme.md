Sequite is a framework that helps minimize time spent on writing basic server
interaction with javascript and lets you develop dynamic pages using HTML tags.
It is not meant to fully replace external javascript.

At the core of this framework is the file Sequite.js, which contains the code
that enables the framework's functionality.

-> Project Structure
The basic idea is that you have two important folders at the domain root:

1. sequite_components
this folder contains templates for html tags that can be set up
to get updated dynamically

2. sequite_resources
this folder contains resources used with Sequite, although
you can use any file in your web directory with a little
tweak to the request syntax [not yet implemented]

-> Basic Concepts
Suppose we have 3 files:
- Sequite.html
- sequite_components/ABC.seq.htm
- sequite_components/IMAGE/IMG.seq.htm

Sequite.html contains the following 2 lines:
	... <seq:ABC border="1" inject="{SRC}{images/cat.png}"></seq:ABC>
		<script src="Sequite.js"></script> ...

and sequite_components/ABC.seq.htm looks like this:
<div style="color: purple;">
    <p> This is a basic Sequite query with injection (src = {SRC}) </p>
    <seq:IMAGE:IMG src="{SRC}"></seq:IMAGE:IMG>
</div>

We can observe some basic concepts of Sequite: components and injections.

When the page is loaded, Sequite will search for components (tags whose
names are prefixed with "seq:") and "Resolve" them, which is a function
pipeline explained further below

An injection is a replacement of some user-defined token with an
user-defined value. The token-value pairs are defined in the
inject attribute of a Sequite component. These pairs are parsed
and then used to replace the given token in the component
before rendering it on the page.

-> The Resolution Process

Resolution currently starts at the children of the body tag, which is to
be later changed to resolve all tags of the document
(including <html> and <head> & children).

A single tag's resolution process looks like this:

1. Check if the given tag is a Sequite component,
    if yes => continue to step 2
    if no  => jump to step 7
2. Parse the injections of the given component
3. Get the component's source (from server or cache)
4. Apply the injections to the component's source
5. Instantiate the component
6. Copy non-Sequite-specific attributes from the original tag to
    the instantiated component
7. Resolve the tag's children

Notice that components can have children that are also components.
The children are being resolved too.

-> Feedback

Try Sequite out and give me feedback on what you
would like to see added/improved!
