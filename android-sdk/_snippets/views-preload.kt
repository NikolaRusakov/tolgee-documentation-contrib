override fun onStart() {
  super.onStart()

  // Make sure the translations are loaded
  // This function will initiate translations fetching in the background and
  // will trigger changeFlow whenever updated translations are available
  tolgee.preload(this)
}
