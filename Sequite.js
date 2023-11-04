
var seqComponents = {};
var seqResources = {};

const matchElems = /(?:^\<){1}(.*)(?:\>){1}(.*)(?:\<\/.*\>(?!\>)){1}.*$/; // !unused
const seqEvents = [
    'onclick',
    'onhover',
    ''
];



function AppendCall(old, fn)
{
    if (typeof(old) !== 'function') return fn;
    return () => { old(); fn(); };
}

function ParseInjections(str)
{
    var i = 0;
    var len = str.length;
    var map = {};
    var symbol = null;
    var value = null;
    var state = 0;
    while (i < len)
    {
        switch (state)
        {
            case 0:
                if (str[i] == '{')
                {
                    if (symbol != null) value = "", state = 2;
                    else symbol = "", state = 1;
                }
                break;
            case 1:
                if (str[i] == '}')
                {
                    state = 0;
                }
                else if (str[i] == '\\')
                {
                    i++;
                    symbol = symbol + str[i];
                }
                else 
                {
                    symbol = symbol + str[i];
                }
                break;
            case 2:
                if (str[i] == '}')
                {
                    map[symbol] = value;
                    symbol = null;
                    value = null;
                    state = 0;
                }
                else if (str[i] == '\\')
                {
                    i++;
                    value = value + str[i];
                }
                else 
                {
                    value = value + str[i];
                }
                break;
        }
        i++;
    }
    return map;
}

function DOMElementFromString(str)
{
    //var [__unused__, signature, innerHtml] = matchElems.exec(str);
    var gen = document.createElement('div');
    gen.innerHTML = str;
    var elem = gen.children.item(0);
    gen.removeChild(elem);
    return elem;
}

async function RequestSequiteComponent(rl)
{
    rl = rl.replaceAll(':', '/');
    console.log("requesting " + rl);
    if (seqComponents[rl] !== undefined) return seqComponents[rl];
    var responseText = await (await fetch("sequite_components/" + rl + ".seq.htm")).text();
    seqComponents[rl] = responseText;
    return responseText;
}

async function RefreshSequiteComponent(rl)
{
    rl = rl.replaceAll(':', '/');
    var responseText = await (await fetch("sequite_components/" + rl + ".seq.htm")).text();
    seqComponents[rl] = responseText;
    return responseText;
}

async function RequestSequiteResource(rl)
{
    rl = rl.replaceAll(':', '/');
    if (seqResources[rl] !== undefined) return seqResources[rl];
    var responseText = await (await fetch("sequite_resources/" + rl)).text();
    seqResources[rl] = responseText;
    return responseText;
}

async function RefreshSequiteResource(rl)
{
    rl = rl.replaceAll(':', '/');
    var responseText = await (await fetch("sequite_resources/" + rl)).text();
    seqResources[rl] = responseText;
    return responseText;
}

function IsSequiteResolvable(tag)
{
    return tag.tagName.toUpperCase().startsWith("SEQ:");
}

function GetInjectionMap(tag)
{
    var map = undefined;
    if (tag.attributes['inject'] !== undefined)
    {
        map = ParseInjections(tag.attributes['inject'].value);
        tag.attributes.removeNamedItem('inject');
    }
    return map;
}

function InjectMap(text, map)
{
    if (map !== undefined) for (var key in map)
    {
        text = text.replaceAll("{" + key + "}", map[key]);
    }
    return text;
}

function ForwardAttributes(fromTag, toTag)
{
    for (var attr of fromTag.attributes)
    {
        toTag.attributes.setNamedItem(attr.cloneNode());
    }
}

async function ResolveTag(tag)
{
    if (IsSequiteResolvable(tag))
    {
        var map = GetInjectionMap(tag);
        var res = await RequestSequiteComponent(tag.tagName.substring(4));
        res = InjectMap(res, map);
        var newElement = DOMElementFromString(res);
        ForwardAttributes(tag, newElement);
        tag.replaceWith(newElement);
        tag = newElement;
    }
    for (var node of tag.children)
    {
        ResolveTag(node);
    }
}

async function LoadComponents()
{
    for (var node of document.body.children)
    {
        ResolveTag(node);
    }
}

function onPageLoaded()
{
    LoadComponents();
}

window.onload = AppendCall(window.onload, onPageLoaded);
