O1 =
O = @
OO = $(O$(V))

OMETA = $(OO) echo " GEN " $@; ./gnometa
GCR = $(OO) echo " GLIB_COMPILE_RESOURCES " $@; glib-compile-resources

OMETA_FILES = \
	ExprParser.ometa \
	JsGen.ometa

org.gnome.JsExpr.gresource: org.gnome.JsExpr.gresource.xml *.ui *.css
	$(OO) $(GCR) --sourcedir=. org.gnome.JsExpr.gresource.xml

Parser.js: $(OMETA_FILES)
	$(OMETA) -b $< > $@

GENERATED_FILES = \
	Parser.js \
	org.gnome.JsExpr.gresource

all: $(GENERATED_FILES)

clean:
	$(OO) rm -f $(GENERATED_FILES)
