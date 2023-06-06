import yoga from "yoga-layout-prebuilt";
export const flexDirectionMap = {
  row: yoga.FLEX_DIRECTION_ROW,
  "row-reverse": yoga.FLEX_DIRECTION_ROW_REVERSE,
  column: yoga.FLEX_DIRECTION_COLUMN,
  "column-reverse": yoga.FLEX_DIRECTION_COLUMN_REVERSE,
};

export const justifyContentMap = {
  "flex-start": yoga.JUSTIFY_FLEX_START,
  center: yoga.JUSTIFY_CENTER,
  "flex-end": yoga.JUSTIFY_FLEX_END,
  "space-between": yoga.JUSTIFY_SPACE_BETWEEN,
  "space-around": yoga.JUSTIFY_SPACE_AROUND,
  "space-evenly": yoga.JUSTIFY_SPACE_EVENLY,
};

export const alignItemsMap = {
  center: yoga.ALIGN_CENTER,
  "flex-start": yoga.ALIGN_FLEX_START,
  "flex-end": yoga.ALIGN_FLEX_END,
  stretch: yoga.ALIGN_STRETCH,
};

export const flexWrapMap = {
  wrap: yoga.WRAP_WRAP,
  nowrap: yoga.WRAP_NO_WRAP,
  "wrap-reverse": yoga.WRAP_WRAP_REVERSE,
};
