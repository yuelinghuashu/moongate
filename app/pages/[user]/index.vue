<script lang="ts" setup>
const { user } = useUserSession();
const route = useRoute();
const localePath = useLocalePath();

if (user.value.login === route.params.user) {
  navigateTo(localePath(`/${route.params.user}/profile`));
} else {
  navigateTo(localePath("/404"));
}
</script>
