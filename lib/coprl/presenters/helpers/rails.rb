if defined?(::Rails)
  module Coprl
    module Presenters
      module Helpers
        module Rails
          include ActionView::Helpers::AssetUrlHelper
          include Currency
          include ModelTable
          include Routes
          include Namespace
          include DetermineHost

          def presenters_path(presenter, host: false, **params)
            presenter = _expand_namespace_(presenter, namespace)
            presenter = presenter.gsub(':', '/')
            host = determine_host(host, default: router.base_url)

            path = if defined?(coprl_presenters_rails_engine_url)
              host ? coprl_presenters_rails_engine_url(**params, host: host) :
                       coprl_presenters_rails_engine_path(**params)
            else
              host ? coprl_presenters_web_client_app_url(**params, host: host) :
                       coprl_presenters_web_client_app_path(**params)
            end

            if path.include?('?')
              path = path.sub('?', "#{presenter}?")
            else
              path = "#{path}/" unless path.end_with?('/')
              # replace last / with the presenter
              path = path.reverse.sub('/', "/#{presenter}".reverse).reverse
            end
            path
          end

          alias presenter_path presenters_path

          def presenters_url(presenter, host: true, **params)
            presenters_path(presenter, host: host, **params)
          end

          alias presenter_url presenters_url

          def path_to_asset(source, options = {})
            unless options[:host]
              asset_host = Settings.config.presenters.web_client.asset_host
              asset_host = asset_host.call(request) if asset_host.respond_to?(:call)
              options[:host] = asset_host
            end

            super
          end
        end
      end
    end
  end
end
