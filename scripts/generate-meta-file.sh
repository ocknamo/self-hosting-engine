#!/bin/bash

# Default
VALUE_PATH="./dist/"
VALUE_FILENAME="appfilelist.json"

# Get arguments
while getopts p:n: OPT
do
  case $OPT in
    "p" ) FLG_PATH="TRUE" ; VALUE_PATH="$OPTARG";;
    "n" ) FLG_FILENAME="TRUE" ; VALUE_FILENAME="$OPTARG" ;;
  esac
done

# Validations
# Path validation.
if [ ${VALUE_PATH: -1} != "/" ]; then
  echo "Invalid path. It should be end with '/'. path: $VALUE_PATH"
  exit 1
fi

# File name validation.
if [[ "$VALUE_FILENAME" =~ .{5}$ ]] ; then
  if [ "${BASH_REMATCH[0]}" != ".json" ] ; then
      echo "Invalid file name. It should be end with '.json'. file name: $VALUE_FILENAME"
      exit 1
  fi
fi

# Prepare
pushd $VALUE_PATH
# Add export file
touch $VALUE_FILENAME
# Get file list from builded directory.
list=`find -type f`
pushd

# Remove './' prefix.
i=0
for eachValue in ${list[@]}; do
  list[$i]=${eachValue#\.\/} 
  let i++
done

# Format to json
i=0
for eachValue in ${list[@]}; do
  list[$i]="\"${eachValue}\""
  let i++
done
result="{\"filenames\":[$(IFS=","; echo "${list[*]}")]}"

# Exporting a file
echo "Exporting to $VALUE_PATH$VALUE_FILENAME"
echo $result
echo $result > $VALUE_PATH$VALUE_FILENAME
