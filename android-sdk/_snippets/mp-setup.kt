import io.tolgee.Tolgee

object Setup {

  fun init() {
    Tolgee.init {
      contentDelivery {
        url = "https://cdn.tolg.ee/your-cdn-url-prefix"
      }
    }
  }
}
