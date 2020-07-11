$PLUGIN_TS="./node_modules/.bin/protoc-gen-ts.cmd"
$PLUGIN_GRPC="./node_modules/.bin/grpc_tools_node_protoc_plugin.cmd"
$DIST_DIR="./"

$ABS_PLUGIN_TS=Resolve-Path -Path "$PLUGIN_TS" | select -ExpandProperty Path
$ABS_PLUGIN_GRPC=Resolve-Path -Path "$PLUGIN_GRPC" | select -ExpandProperty Path
$ABS_DIST_DIR=Resolve-Path -Path "$DIST_DIR" | select -ExpandProperty Path

protoc --js_out=import_style=commonjs,binary:"$ABS_DIST_DIR" --ts_out=import_style=commonjs,binary:"$ABS_DIST_DIR" --grpc_out="$ABS_DIST_DIR" --plugin=protoc-gen-grpc="$ABS_PLUGIN_GRPC" --plugin=protoc-gen-ts="$ABS_PLUGIN_TS" --proto_path=./ -I "$ABS_DIST_DIR" ./*.proto