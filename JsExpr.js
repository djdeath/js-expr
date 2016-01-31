const Cairo = imports.cairo;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

Gio.resources_register(Gio.resource_load('org.gnome.JsExpr.gresource'));

const Parser = imports.Parser;
const StructureView = imports.StructureView;

//

Gtk.init(null, null);

let builder = Gtk.Builder.new_from_resource('/org/gnome/JsExpr/JsExpr.ui');
let $ = function(name) { return builder.get_object(name); };

//
$('close-button').connect('clicked', Gtk.main_quit);
$('window').show();

let struct1 = new StructureView.StructureView();
$('expr1-box').pack_start(struct1, true, true, 0);

let makeEmptyFunctor = function() {
  return function(ctx) {
    return 0;
  };
};

let makeFunctionFromExpr = function(tree) {
  try {
    let s = '(function() { return function(ctx) { return ' + Parser.JsGen.match(tree, 'trans') + '; }; })();';
    log(s);
    return eval(s);
  } catch (e) {
    log(e);
    return makeEmptyFunctor();
  }
};

let functor = makeEmptyFunctor();

struct1.onHover(function(node) {
  functor = makeFunctionFromExpr(node);
  $('canvas').queue_draw();
});

let expr1 = $('expr1')
expr1.connect('notify::text', function() {
  let text = expr1.text;
  try {
    log('text=' + text);
    let structure = Parser.ExprParser.matchAllStructure(text, 'top');
    log(structure);
    let tree = structure.value;
    let p = function(node) {
      return Parser.JsGen.match(node, 'trans');
    };
    struct1.setData(tree, p, p);
    if (tree == null)
      functor = makeEmptyFunctor();
    else
      functor = makeFunctionFromExpr(tree);
    $('canvas').queue_draw();
  } catch (e) {
    log('Error: ' + e + ' idx=' + e.idx);
  }
});

$('canvas').connect('draw', function(w, cr) {
  let alloc = w.get_allocation();
  let ctx = {
    cos: Math.cos,
    sin: Math.sin,
    tan: Math.tan,
    atan: Math.atan,
    x: -alloc.width / 2 };

  // Clear
  cr.setSourceRGBA(1.0, 1.0, 1.0, 1.0);
  cr.rectangle(0, 0, alloc.width, alloc.height);
  cr.fill();

  cr.setSourceRGB(0.2, 0.2, 0.2);
  cr.moveTo(0, alloc.height / 2 - functor(ctx));
  for (let i = 0; i < alloc.width; i++) {
    try {
      ctx.x += 1;
      cr.lineTo(i, alloc.height / 2 - functor(ctx));
    } catch(e) {
      log(e);
      break;
    }
  }
  cr.stroke();
});

Gtk.main();
