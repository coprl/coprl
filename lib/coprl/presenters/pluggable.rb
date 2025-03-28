# frozen_string_literal: true

include Coprl::Trace

module Coprl
  module Presenters
    module Pluggable
      def include_plugins(*layers, plugins: [], plugin_method: method(:include))
        plugins = Array(plugins) + Array(Coprl::Presenters::Settings.config.presenters.plugins)
        plugins.uniq.each do |plugin|
          plugin(plugin, layers, plugin_method: plugin_method)
        end
      end

      # Returns the module for the specified plugin. If the module is not
      # defined, the corresponding plugin required.
      def plugin_module(plugin)
        @plugin_name_cache ||= {}
        @plugin_name_cache[plugin] ||= classify(plugin)
        module_name = @plugin_name_cache[plugin]

        unless Coprl::Presenters::Plugins.const_defined?(module_name, false)
          load "coprl/presenters/plugins/#{plugin}.rb"
        end

        Coprl::Presenters::Plugins.const_get(module_name)
      end

      def plugin(plugin, layers, plugin_method: method(:include))
        m = plugin.is_a?(Module) ? plugin : plugin_module(plugin)
        layers.each do |layer|
          if m.const_defined?(layer, false) && !self.const_defined?(layer, false)
            plugin_method.call(m.const_get(layer))
          end
        end
      end

      # a multibyte-unaware method for converting a snake_case string to a PascalCase const name.
      # note that this method is optimized to minimize allocations – please be wary of this when
      # refactoring.
      def classify(plugin_name)
        string = plugin_name.to_s
        result = +"" # mutable string
        capitalize_next = true
        len = string.length # cache string length to avoid multiple calls
        i = 0

        # the following is equivalent to String#each_char. however, each_char allocates and yields
        # a string of length 1 to its enumerator, which is undesirable here.
        while i < len
          char = string[i]

          if char.ord == 95 # underscore
            capitalize_next = true
          else
            result << (capitalize_next ? char.upcase : char)
            capitalize_next = false
          end

          i += 1
        end

        result
      end
    end
  end
end
