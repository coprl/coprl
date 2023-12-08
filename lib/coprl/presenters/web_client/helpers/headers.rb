module Coprl
  module Presenters
    module WebClient
      module Helpers
        module Headers
          include HtmlSafe

          def coprl_headers
            return unless @pom

            # TODO: digest file contents.
            @bundle_css ||= asset_url("#{request.env['SCRIPT_NAME']}bundle.css?v=653a36a9b8a877074d6357c1fa5920eb2b9a9739")
            @bundle_js ||= asset_url("#{request.env['SCRIPT_NAME']}bundle.js?v=87618f772b7c9c5212ecff20204c47e0c0329a89")

            html_safe <<~HTML
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700" type="text/css">
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

            file_paths.map do |path:, digest:|
              relative_file_path = path.relative_path_from(pwd)
              url = asset_url(relative_file_path)

              <<~HTML
                <link rel="stylesheet" type="text/css" href="#{url}?v=#{digest}">
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
            diget = Digest::SHA1.hexdigest(File.read(path))
            url = asset_url("#{env['SCRIPT_NAME']}#{path.sub('public/','')}")
            <<~HTML
              <script defer src="#{url}?v=#{digest}"></script>
            HTML
          end
        end
      end
    end
  end
end
