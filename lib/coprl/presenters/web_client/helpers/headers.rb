module Coprl
  module Presenters
    module WebClient
      module Helpers
        module Headers
          include HtmlSafe

          def coprl_headers
            return unless @pom

            # TODO: digest file contents.
            script_name = defined?(::Rails) ? request.env['SCRIPT_NAME'] : "localhost:9292/"
            @bundle_css ||= asset_url("/#{script_name}bundle.css?v=33d0c0d8af54a10915131958f0f16a130214a8a3")
            @bundle_js ||= asset_url("/#{script_name}bundle.js?v=0742c562e4b1bce4b5869f08ec88ca33e8cee204")

            html_safe <<~HTML
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Icons&family=Material+Icons+Outlined">
              <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm" crossorigin="anonymous">
              <link rel="stylesheet" href="#{@bundle_css}">
              <script defer src="#{@bundle_js}"></script>
              #{plugin_headers(@pom)}
              #{custom_css(request.env['REQUEST_PATH'])}
              #{@pom.csrf_meta_tags}
            HTML
          end

          private

          def asset_url(path)
            if asset_host
              asset_host = asset_host.call(request) if asset_host.respond_to?(:call)
              path = "#{asset_host}/#{path}"
            end

            path
          end

          def asset_host
            Settings.config.presenters.web_client.asset_host
          end

          def plugin_headers(pom)
            PluginHeaders.new(pom: pom, render: method(:render_partial)).render
          end

          def custom_css(request_path)
            file_paths = CustomCss.new.call(request_path)
            pwd = Pathname.new(Dir.pwd)

            custom_css = []

            custom_css << file_paths.map do |file_path|
              path = file_path[:path]
              digest = file_path[:digest]
              relative_file_path = path.relative_path_from(pwd)
              url = asset_url(relative_file_path)

              <<~HTML
                <link rel="stylesheet" type="text/css" href="/#{url}?v=#{digest}">
              HTML
            end

            custom_css << Settings.config.presenters.web_client.custom_css_uris.map do |uri|
              <<~HTML
                <link rel="stylesheet" type="text/css" href="/#{uri}">
              HTML
            end

            custom_css.join("\n")
          end

          def custom_js
            custom_js_path = Settings.config.presenters.web_client.custom_js
            Dir.glob(custom_js_path).map do |file|
              _build_script_tag_(file)
            end.join("\n") if custom_js_path
          end

          def _build_script_tag_(path)
            diget = Digest::SHA1.hexdigest(File.read(path))
            url = asset_url("#{env['SCRIPT_NAME']}#{path.sub('public/','')}")
            <<~HTML
              <script defer src="/#{url}?v=#{digest}"></script>
            HTML
          end
        end
      end
    end
  end
end
