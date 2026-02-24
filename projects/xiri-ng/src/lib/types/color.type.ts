// Theme colors (from $theme-color-variants in colors.scss)
export type XiriThemeColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'warn' | 'error' | 'success';

// Extended colors (from $color-variants in colors.scss)
export type XiriExtendedColor = 'emerald' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray' | 'lightgray' | 'darkgray' | 'orange';

// Combined type for all available colors
export type XiriColor = XiriThemeColor | XiriExtendedColor;
