require 'rails/generators/erb/scaffold/scaffold_generator'

module Pom
  module Generators
    class ScaffoldGenerator < Erb::Generators::ScaffoldGenerator
      source_root File.expand_path(File.join('..', 'templates'), __FILE__)

      def copy_view_files
        available_views.each do |view|
          filename = filename_with_extensions view
          template "#{view}.html.pom", File.join('app', 'views', controller_file_path, filename)
        end
      end

      def resource_route
        route "resources :#{file_name.pluralize}, only: [:create, :destroy, :update]", namespace: regular_class_path
      end

      hook_for :form_builder, as: :scaffold

      protected
      def available_views
        ['index', 'edit', 'show', 'new', '_form']
      end

      def handler
        :pom
      end
    end
  end
end
