<script>
  export let onClick
</script>

<style>
.button {
  user-select: none;
  position: relative;
  display: inline-block;
  background: #bbada0;
  padding: 8px 12px;
  font-size: 20px;
  height: 25px;
  font-weight: bold;
  border-radius: 3px;
  color: white;
  margin-bottom: 8px;
  text-align: center;
  cursor: pointer;
}
</style>

<div class="button" on:click={onClick}>
  <slot></slot>
</div>
