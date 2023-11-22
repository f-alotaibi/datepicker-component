# datepicker-component
A Simple date picker, made using web components

This component is mainly from [beforesemicolon datepicker](https://codepen.io/beforesemicolon/pen/jOMgZrY), replaced its date implementation with Javascript's `Date` for smaller size, along with easier styling.

The component size is 14kb unminified

[Example](https://f-alotaibi.github.io/datepicker-component/)
# Getting started
Include the component
```
<script src="https://cdn.jsdelivr.net/gh/f-alotaibi/datepicker-component@main/src/datepicker.js" defer></script>
```
Use the minified version for production
```
<script src="https://cdn.jsdelivr.net/gh/f-alotaibi/datepicker-component@main/src/datepicker-min.js" defer></script>
```
Also include a css file for styling, the repostory has [a style file](https://github.com/f-alotaibi/datepicker-component/blob/main/src/datepicker.css)
```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/f-alotaibi/datepicker-component@main/src/datepicker.css">
```
And simply type to your html
```
<date-picker></date-picker>
```

# Attributes
`format`: changes the format of the output

`week-days-disabled`: disables specified weekdays 

`begin-date`: disables dates that are before

`end-date`: disables dates that are after
