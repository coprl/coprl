require "erb"

module Coprl
  module Presenters
    module WebClient
      # This class renders headers for the plugins into the default layout.
      class PluginHeaders
        extend Pluggable
        include_plugins(:WebClientComponents)

        def initialize(pom:, render:)
          @pom = pom
          @render = render
          initialize_plugins
        end

        def render
          results = ""

          header_plugins.each do |plugin|
            header_method = :"render_header_#{plugin}"
            results << "<!-- Headers for #{plugin} -->\n"
            if respond_to?(header_method)
              results << send(header_method,
                @pom,
                render: @render)
            end
          end
          results
        end

        private

        def header_plugins
          (plugins + Coprl::Presenters::Settings.config.presenters.plugins)
            .uniq
        end

        def plugins
          @plugins || []
        end

        def initialize_plugins
          @plugins = @pom.send(:plugins)
          self.class.include_plugins(:WebClientComponents, plugins: @plugins)
        end
      end
    end
  end
end
