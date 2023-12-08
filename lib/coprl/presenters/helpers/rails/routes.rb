module Coprl
  module Presenters
    module Helpers
      module Rails
        module Routes
          if ::Rails.env.development?
            # Calling `Rails.application.routes.url_helpers` reconstructs the
            # entire routing tree, which is an expensive operation. We want to
            # avoid this behavior when COPRL reloads POMs and included helpers
            # via the COPRL file watcher, and when POMs/helpers call standard
            # Rails URL helper methods (e.g. `foos_path(id: 123)`).
            #
            # Wrapping the anonymous module returned by `#url_helpers` in this
            # Singleton ensures the routing tree is only constructed once, on
            # initial load, instead of on every call.
            #
            # Since files never change in non-development environments, this
            # workaround is only needed in development.
            class UrlHelper
              include Singleton
              include ::Rails.application.routes.url_helpers
            end

            def method_missing(name, *args)
              if UrlHelper.instance.respond_to?(name)
                trace { "delegating ##{name} to UrlHelper" }
                return UrlHelper.instance.public_send(name, *args)
              end

              super
            end
          else
            include ::Rails.application.routes.url_helpers
          end

          def default_url_options
            ::Rails.application.routes.default_url_options ||
              {host: context[:base_url] ? context[:base_url] : context[:request].host_with_port}
          end
        end
      end
    end
  end
end
