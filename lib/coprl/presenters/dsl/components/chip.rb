module Coprl
  module Presenters
    module DSL
      module Components
        class Chip < Base
          include Mixins::Tooltips
          attr_reader :icons, :color, :name, :value, :chipset_variant, :selected

          def initialize(**attribs, &block)
            super(type: :chip, **attribs, &block)
            @icons = []
            self.text(attribs.delete(:text)) if attribs.key?(:text)
            self.icon(attribs.delete(:icon)) if attribs.key?(:icon)
            @color = attribs.delete(:color)
            @name = attribs.delete(:name)
            @value = attribs.delete(:value)
            @selected = attribs.delete(:selected){false}
            expand!
            @chipset_variant = self.parent(:chipset)&.variant

            if @chipset_variant == :input
              @icons = @icons.delete_if { |i| i.position == :right }
              icon(:cancel, position: :right)
            end
          end

          def text(*text, **attribs, &block)
            return @text if locked?
            @text = Components::Typography.new(parent: self, type: :text, text: text, **attribs, &block)
          end

          def icon(icon=nil, **attribs, &block)
            @icons << Icon.new(parent: self, icon: icon, **attribs, &block)
          end

          def menu(**attributes, &block)
            return @menu if locked?
            @menu = Components::Menu.new(parent: self, **attributes, &block)
          end

          def choice?
            chipset_variant == :choice
          end

          def filter?
            chipset_variant == :filter
          end

          def input?
            chipset_variant == :input
          end

          class Icon < Components::IconBase
            def initialize(**attribs, &block)
              super(**attribs, &block)
              @position = [:left] if position.empty?
              expand!
            end
          end
        end
      end
    end
  end
end
