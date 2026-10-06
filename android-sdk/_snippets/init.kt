import android.app.Application
import io.tolgee.Tolgee
import io.tolgee.storage.TolgeeStorageProviderAndroid

class MyApplication : Application() {

  override fun onCreate() {
    super.onCreate()

    Tolgee.init {
      contentDelivery {
        url = "https://cdn.tolg.ee/your-cdn-url-prefix"
        storage = TolgeeStorageProviderAndroid(this@MyApplication, BuildConfig.VERSION_CODE)
        availableLocaleTags("cs", "en", "fr", "sv")
      }
      defaultLanguage("en")
    }
  }
}
