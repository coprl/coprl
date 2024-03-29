require "dry/inflector"
require_relative 'inflectors'

module Coprl
  module Presenters
    module Generators
      class Plugin < ::Thor::Group
        TEMPLATES_ROOT = File.join('templates','plugin')
        LIB_ROOT = File.join('lib','coprl','presenters','plugins')
        include Thor::Actions
        argument :name

        def self.exit_on_failure?
          true
        end

        def initialize(args = [], local_options = {}, config = {})
          @inflector = Dry::Inflector.new
          super
        end

        def self.source_root
          File.dirname(__FILE__)
        end

        no_tasks do
          include Coprl::Presenters::Generators::Inflectors

          def join_path(*parts)
            File.join(*parts.compact)
          end

          def template_file(template, target_filename=template, source_path=nil, target_path=source_path)
            source = join_path(TEMPLATES_ROOT, source_path, "#{template}.tt")
            destination = join_path(plugin_name, target_path, target_filename)
            template source, destination
          end

          def file(file, target_filename=file, source_path=nil, target_path=nil)
            source = join_path(TEMPLATES_ROOT, source_path, file)
            destination = join_path(plugin_name, target_path, target_filename)

            copy_file source, destination
          end

          def lib_dir(*args)
            dir(LIB_ROOT, *args)
          end

          def dir(*args)
            join_path(*args)
          end
          
          def named_dir(*args)
            lib_dir(underscored_name, *args)
          end
          
          def underscored_name
            underscore(name)
          end

          def plugin_name
            "#{underscored_name}_presenter_plugin"
          end
        end

        def create_version
          template_file('version.rb', "version.rb", LIB_ROOT, "lib/#{underscored_name}_presenter_plugin")
        end

        def create_root_files
          file('.gitignore')
          template_file('Gemfile')
          template_file('LICENSE.txt')
          template_file('presenter_plugin.gemspec', "#{underscored_name}_presenter_plugin.gemspec")
          template_file 'README.md'
        end

        def create_semantic_release_github_action
          file('.releaserc')
          file('.ruby-version')
          file('semantic-release.yml', 'semantic-release.yml',
               dir('.github', 'workflows'), dir('.github', 'workflows'))
        end

        def create_plugin
          template_file('plugin.rb', "#{underscored_name}.rb", LIB_ROOT)
        end

        def create_component_files
          template_file('component.rb', "#{underscored_name}_component.rb",
                        lib_dir('components'),
                        named_dir('components'))
          template_file('dsl.rb', "#{underscored_name}_dsl.rb",
                        lib_dir('components'),
                        named_dir('components'))
          template_file('render.rb', "#{underscored_name}_render.rb",
                        lib_dir('web_client', 'components'),
                        named_dir('web_client', 'components'))
          template_file('component.css', "#{underscored_name}.css",
                        dir('views', 'assets', 'css', 'components'))
          template_file('component.js', "#{underscored_name}.js",
                        dir('views', 'assets', 'js', 'components'))
          template_file('component.erb', "_#{underscored_name}.erb",
                        dir('views', 'components', 'application'))
          template_file('component_header.erb', "_#{underscored_name}_header.erb",
                        dir('views', 'components', 'application'))
        end

        def create_action_files
          template_file('action.rb', "#{underscored_name}_action.rb",
                        lib_dir('components', 'actions'),
                        named_dir('components', 'actions'))
          template_file('dsl.rb', "#{underscored_name}_dsl.rb",
                        lib_dir('components', 'actions'),
                        named_dir('components', 'actions'))
          template_file('data.rb', "#{underscored_name}_data.rb",
                        lib_dir('web_client', 'components', 'actions'),
                        named_dir('web_client', 'components', 'actions'))
          template_file('action.js', "#{underscored_name}.js",
                        dir('views', 'assets', 'js', 'components', 'actions'))
        end

        def create_helper_files
          template_file('helper.rb', "#{underscored_name}_helper.rb",
                        lib_dir('helpers'),
                        named_dir('helpers'))
        end

        def create_demo_pom
          template_file('plugin.pom', "#{underscored_name}.pom", dir('demo'))
        end
      end
    end
  end
end
