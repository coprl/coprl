require 'ice_nine'

module Coprl
  module Presenters
    module DSL
      class UserInterface
        include DSL::Definer
        include DSL::ProtectFromForgery
        include Components::Mixins::Common
        include Components::Mixins::Helpers
        include Components::Mixins::Dialogs
        include Components::Mixins::Snackbars
        include Components::Mixins::Icons
        include Components::Mixins::TextFields
        include Components::Mixins::DateTimeFields
        include Components::Mixins::Attaches
        include Components::Mixins::Event
        extend Pluggable
        include_plugins(:DSLComponents, :DSLHelpers)

        include Coprl::Serializer
        include Coprl::Trace

        attr_reader :router, :context, :components, :name, :namespace
        private :router, :namespace
        alias params context

        def initialize(context:, parent: nil, router: nil, name: nil, plugins: [], namespace: [], &block)
          @parent = parent
          @router = router || @parent&.send(:router)
          @context = context || {}
          @block = block
          @header = nil
          @drawer = nil
          @components = []
          @footer = nil
          @name = name
          @namespace = namespace
          @plugins = plugins || []
          @csrf_meta_tags = authenticity_token_meta_tags(@context.fetch(:session, nil))
          add_global_helpers
          initialize_plugins
        end

        def page(title = nil, **attribs, &block)
          return @page if locked?
          @page = Components::Page.new(parent: self, **attribs, &block)
        end

        def drawer(name = nil, **attribs, &block)
          return @drawer if locked?
          @drawer = Components::Drawer.new(parent: self, title: name,
                                           **attribs, &block)
        end

        def footer(**attribs, &block)
          return @footer if locked?
          @footer = Components::Footer.new(parent: self,
                                           **attribs, &block)
        end

        def progress(**attributes, &block)
          self << Components::Progress.new(parent: self, **attributes, &block)
        end

        def attach(presenter, params = {}, &yield_block)
          pom = super
          @header ||= pom.header
          @drawer ||= pom.drawer
          @footer ||= pom.footer
        end

        # Called by the definition.expand method to evaluate a user interface with a different context
        # This should be made unavailable to the dsl
        def expand_instance(freeze: true)
          instance_eval(&@block)
          lock!
          deep_freeze if freeze
          self
        end

        def url(**context_)
          return '#' unless @router
          context = context_.dup
          link_to = context.delete(:link)
          post_to = context.delete(:command)
          @router.url(render: link_to, command: post_to, context: context)
        end

        def type
          :presenter
        end

        def plugin(*plugin_names)
          new_plugin_names = plugin_names - @plugins

          @plugins.push(*new_plugin_names)
          self.class.include_plugins(:DSLComponents, :DSLHelpers, plugins: new_plugin_names)
        end

        def plugins
          return @plugins if locked?
          return @plugins if @plugins
        end
        alias _plugins_ plugins

        def csrf_meta_tags
          Presenters::Settings.config.presenters.web_client.protect_from_forgery ? @csrf_meta_tags : nil
        end

        private

        def deep_freeze
          IceNine.deep_freeze(self) if Presenters::Settings.config.presenters.deep_freeze
          self
        end

        def parent(for_type)
          nil
        end

        def _helpers_
          return @helpers if @helpers
        end

        def yield_block
          return @_yield_block_ if @_yield_block_
          @parent.send(:yield_block) if @parent
        end

        def add_global_helpers
          Presenters::Settings.config.presenters.helpers.each do |helper|
            self.helpers(helper)
          end
        end

        def initialize_plugins
          self.class.include_plugins(:DSLComponents, :DSLHelpers, plugins: @plugins)
        end

        def lock!
          @locked = true
        end

        def locked?
          @locked
        end
      end
    end
  end
end

