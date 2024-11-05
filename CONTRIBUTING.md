**Note after you build for Deadbolt Auto**: Ensure all links in Deadbolt Auto's folder are relatively linking most likely scripts in index.html e.g
```html
<!--Ensure-->
<script type="module" crossorigin src="assets/sth.js"></script>
<!--Instead of-->
<script type="module" crossorigin src="/assets/sth.js"></script>
```