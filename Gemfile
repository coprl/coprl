source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby `[ -z "$RBENV_VERSION" ] && cat .ruby-version || echo $RBENV_VERSION`

gemspec

group :development do
  gem 'pry'
  gem 'pry-byebug'
end

group :test do
  gem 'rspec'
  gem 'rspec-html-matchers'
  gem 'watir', '~> 7'
  gem 'webdrivers', '= 5.3.0' # lock to 5.3.0 per warning when installing webdrivers
  gem 'watir-rspec', '~> 5'
  gem 'rspec_junit_formatter'
  gem 'simplecov', require: false
end

# Plugins
gem 'foo_presenter_plugin', github: 'coprl/foo_presenter_plugin', require: false
gem 'image_crop_presenter_plugin', github: 'coprl/image_crop_presenter_plugin', require: false
gem 'chart_presenter_plugin', github: 'coprl/chart_presenter_plugin', require: false
gem 'google_maps_presenter_plugin', github: 'coprl/google_maps_presenter_plugin', branch: :main, require: false
gem 'cacheable_presenter_plugin', github: 'coprl/cacheable_presenter_plugin', require: false
gem 'script_presenter_plugin', github: 'coprl/script_presenter_plugin', require: false
gem 'scroll_to_presenter_plugin', github: 'coprl/scroll_to_presenter_plugin', require: false
gem 'clipboard_presenter_plugin', github: 'coprl/clipboard_presenter_plugin', require: false
gem 'markup_presenter_plugin', github: 'coprl/markup_presenter_plugin', require: false
gem 'iframe_presenter_plugin', github: 'coprl/iframe_presenter_plugin', require: false
gem 'color_picker_presenter_plugin', github: 'coprl/color_picker_presenter_plugin', require: false
gem 'timer_presenter_plugin', github: 'coprl/timer_presenter_plugin', require: false
gem 'animate_presenter_plugin', github: 'coprl/animate_presenter_plugin', require: false

gem 'rack-cors'
gem 'honeybadger' if ENV.fetch('HONEYBADGER_API_KEY', false)
gem 'puma'
gem 'dotenv'
