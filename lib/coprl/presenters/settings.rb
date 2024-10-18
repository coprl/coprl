#include Coprl::Trace
#trace {"Loading Presenters Settings"}
require 'dry-configurable'

unless defined?(Coprl::Presenters::Settings)
  module Coprl
    module Presenters
      class Settings
        extend ::Dry::Configurable
        setting :presenters do
          setting :root, default: []
          # You can add helpers that will automatically be included
          # For example:
          # Coprl::Presenters::Settings.configure do |config|
          #   config.presenters.helpers << YourHelperModule # Passing a module
          #   config.presenters.helpers << &->{ def foo; :foo; end } # Passing a block
          # end
          setting :helpers, default: [Coprl::Presenters::Helpers::Route]
          setting :deep_freeze, default: false
          setting :id_generator, default: ->(node) {"id-#{SecureRandom.hex}"}
          setting :web_client do
            # Add lambda's to modify the context for the presenters
            # For example:
            # Coprl::Presenters::Settings.configure do |config|
            #   config.presenters.web_client.prepare_context << ->(context, session, _env){
            #     identity_id = session[:aaa_identity]
            #     context.merge(aaa_identity: identity_id)
            #   }
            # end
            setting :prepare_context, default: []
            # Relative to the root
            setting :custom_css, default: '../public/presenters'
            setting :custom_css_uris, default:  []
            setting :protect_from_forgery, default:  false
            setting :asset_host, default: proc { |request| request.base_url }
            setting :test_id_attribute, default: 'data-testid'
          end
          setting :plugins, default: []
          setting :components do
            setting :defaults do
              setting :datetime do
                setting :format, default: 'M j, y h:i K'
                setting :time_24hr, default: false
              end
              setting :date do
                setting :format, default: 'F j, Y'
              end
              setting :time do
                setting :format, default: 'h:i K'
                setting :time_24hr, default: false
              end
              setting :text_area do
                setting :rows, default: 3
                setting :cols, default: 80
              end
              # Typography
              setting :headline do
                setting :level, default: 5
              end
              setting :title do
                setting :level, default: 6
              end
              setting :rich_text_area do
                setting :rows, default: 6
                setting :server_upload_path
              end
              setting :padding do
                setting :default_size, default: 2
              end
            end
          end
          setting :error_logger, default: ->(file, e, _params, _presenter_name) {
            msg = [
              "#{Time.now.strftime("%Y-%m-%d %H:%M:%S")} - #{e.class} - #{e.message}:",
              *e.backtrace
            ].join("\n\t")
            file.puts(msg)
          }
          setting :before_render, default: [] # an array of `#call`ables
        end

        def self.default(type, key)
          config.presenters.components.defaults&.public_send(type)&.public_send(key)
        end
      end
    end
  end
end
