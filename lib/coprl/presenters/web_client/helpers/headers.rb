module Coprl
  module Presenters
    module WebClient
      module Helpers
        module Headers
          include HtmlSafe

          def coprl_headers
            return unless @pom

            @bundle_css ||= asset_url("#{request.env['SCRIPT_NAME']}bundle.css")
            @bundle_js ||= asset_url("#{request.env['SCRIPT_NAME']}bundle.js")

            html_safe <<~HTML
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700" type="text/css">
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Icons&family=Material+Icons+Outlined">
              <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.4.1/css/all.css" integrity="sha384-5sAR7xN1Nv6T6+dT2mhtzEpVJvfS3NScPQTrOxhwjIuvcA67KV2R5Jz6kr4abQsz" crossorigin="anonymous">
              <link rel="stylesheet" href="#{@bundle_css}">
              <script defer src="#{@bundle_js}"></script>
              #{plugin_headers(@pom)}
              #{custom_css(request.env['REQUEST_PATH'])}
              #{@pom.csrf_meta_tags}
            HTML
          end

          private

          def asset_url(path)
            asset_host = Settings.config.presenters.web_client.asset_host

            if asset_host
              asset_host = asset_host.call(request) if asset_host.respond_to?(:call)
              path = "#{asset_host}/#{path}"
            end

            path
          end

          def plugin_headers(pom)
            PluginHeaders.new(pom: pom, render: method(:render_partial)).render
          end

          def custom_css(request_path)
            file_paths = CustomCss.new.call(request_path)
            pwd = Pathname.new(Dir.pwd)

            file_paths.map do |path|
              relative_file_path = path.relative_path_from(pwd)
              url = asset_url(relative_file_path)

              <<~HTML
                <link rel="stylesheet" type="text/css" href="#{url}">
              HTML
            end.join("\n")
          end

          def custom_js
            custom_js_path = Settings.config.presenters.web_client.custom_js
            Dir.glob(custom_js_path).map do |file|
              _build_script_tag_(file)
            end.join("\n") if custom_js_path
          end

          def _build_script_tag_(path)
            url = asset_url("#{env['SCRIPT_NAME']}#{path.sub('public/','')}")
            <<~HTML
              <script defer src="#{url}"></script>
            HTML
          end
        end
      end
    end
  end
end
