module Coprl
  module Presenters
    module WebClient
      # This class determines which "custom CSS" files match a given URL path.
      # The following items are returned (as absolute string file paths) if they
      # exist:
      # * "<root>/<custom CSS path>/global.css"
      # * "<root>/<custom CSS path>/<namespace>/global.css"
      # * "<root>/<custom CSS path>/<namespace>/<presenter>.css"
      #
      # So, for example, given a path `/foos/edit_foo?id=4` and the default
      # `web_client.custom_css` configuration value of `../public/presenters`,
      # the following file names would be returned (if they exist):
      # 1) "<root>/public/presenters/global.css"
      # 2) "<root>/public/presenters/foos/global.css"
      # 3) "<root>/public/presenters/foos/edit_foo.css"
      class CustomCss
        include Helpers::HtmlSafe

        def initialize(
          custom_css_path: Settings.config.presenters.web_client.custom_css,
          presenters_root: Settings.config.presenters.root
        )
          @custom_css_path = custom_css_path
          @presenters_root = presenters_root
        end

        def call(path)
          return [] unless custom_css_path

          [global_css, global_namespace_css(path), presenter_css(path)].compact.map do |path|
            path_without_public = path.sub('public/', '')
            digest = Digest::SHA1.hexdigest(path)
            pathname = Pathname.new(File.expand_path(path_without_public))
            {path: pathname, digest: digest}
          end
        end

        private

        def custom_css_path
          @custom_css_path ||= Presenters::Settings.config.presenters.web_client.custom_css
        end

        def presenters_root
          @presenters_root ||= Coprl::Presenters::Settings.config.presenters.root
        end

        # returns a global css file path (by default located at
        # `public/presenters/global.css`)
        def global_css
          css_file = File.join(custom_css_path, 'global.css')
          full_path = File.join(presenters_root, css_file)
          full_path if File.exists?(full_path)
        end

        def global_namespace_css(path)
          return unless path
          namespace_path = path.split('/').reject { |c| c.empty? }.first
          css_file = File.join(custom_css_path, namespace_path ? namespace_path : '')
          css_file = File.join(css_file, 'global.css')
          full_path = File.join(presenters_root, css_file)
          trace {"Loading global namespace: #{full_path}"}
          full_path if File.exists?(full_path)
        end

        # returns the path to a custom css file that matches the presenter
        # `<namespace>/<presenter>.css` (by default located at
        # `public/presenters/<namespace>/<presenter>.css`).
        def presenter_css(path)
          return unless custom_css_path && path
          css_file = File.join(custom_css_path, path)
          css_file = File.join(css_file, 'index') if path == '/'
          css_file = "#{css_file}.css"
          full_path = File.join(presenters_root, css_file)
          full_path if File.exists?(full_path)
        end
      end
    end
  end
end
