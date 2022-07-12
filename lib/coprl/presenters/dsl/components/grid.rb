module Coprl
  module Presenters
    module DSL
      module Components
        class Grid < Base
          include Mixins::Attaches
          include Mixins::Dialogs
          include Mixins::Snackbars
          include Mixins::Progress
          include Mixins::Padding
          include Mixins::Alignment

          attr_reader :columns,
                      :color,
                      :padding,
                      :wide,
                      :gutter,
                      :height,
                      :direction,
                      :hidden

          def initialize(color: nil, **attribs_, &block)
            super(type: :grid, **attribs_, &block)

            @columns = []
            @color = color
            padding = attribs.delete(:padding) {nil}
            @padding = validate_padding!(coerce_padding(padding, default_level: 3)).uniq if padding != nil
            @wide = attribs.delete(:wide) {false}
            @gutter = coerce_gutter(attribs.delete(:gutter) {nil})
            @height = attribs.delete(:height) {nil}
            @direction = validate_direction!(attribs.delete(:direction) { :row })
            @align = validate_alignment!(attribs.delete(:align) { :stretch })
            @justify = validate_alignment!(attribs.delete(:justify) { :stretch })
            @hidden = attribs.delete(:hidden) { false }

            expand!
          end

          def column(size, color: nil, **attribs, &block)
            attribs = size.respond_to?(:keys) ? attribs.merge(size) : attribs.merge(size: size)
            @columns << Column.new(parent: self, color: color, **attribs, &block)
          end

          private

          def coerce_gutter(gutter)
            case gutter
            when true, :full, :all
              true
            when false, :none
              false
            when nil
              nil
            else
              raise Errors::ParameterValidation,
                    "Grid gutter was: #{gutter}. Allowed gutter values are " \
                    "true, false, :full, :all, :none and nil."
            end
          end

          class Column < EventBase
            include Mixins::Common
            include Mixins::Icons
            include Mixins::Attaches
            include Mixins::Dialogs
            include Mixins::Chipset
            include Mixins::TextFields
            include Mixins::DateTimeFields
            include Mixins::Selects
            include Mixins::Toggles
            include Mixins::Snackbars
            include Mixins::Steppers
            include Mixins::Sliders
            include Mixins::FileInputs
            include Mixins::Avatar
            include Mixins::Progress
            include Mixins::Padding
            include Mixins::Alignment

            attr_reader :size,
                        :desktop,
                        :tablet,
                        :phone,
                        :color,
                        :components,
                        :padding,
                        :direction,
                        :overflow,
                        :height

            def initialize(**attribs_, &block)
              super(type: :column, **attribs_, &block)

              @size = attribs.delete(:size) || 1
              @desktop = attribs.delete(:desktop)
              @tablet = attribs.delete(:tablet)
              @phone = attribs.delete(:phone)
              @color = attribs.delete(:color)
              @direction = validate_direction!(attribs.delete(:direction)) if attribs[:direction]
              @align = validate_alignment!(attribs.delete(:align)) if attribs[:align]
              @justify = validate_alignment!(attribs.delete(:justify)) if attribs[:justify]
              @overflow = attribs.delete(:overflow){true}
              @components = []
              padding = attribs.delete(:padding) {nil}
              @padding = validate_padding!(coerce_padding(padding)).uniq if padding != nil
              @height = attribs.delete(:height) {nil}

              expand!
            end
          end
        end
      end
    end
  end
end
