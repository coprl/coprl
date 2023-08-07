module Coprl
  module Presenters
    module DSL
      module Components
        class Chipset < Base
          include Mixins::Chips
          attr_reader :variant, :components, :label, :name, :input_text_field

          VARIANTS = %i[choice filter input static].freeze

          def initialize(variant = :static, **attribs, &block)
            super(type: :chipset, **attribs, &block)
            @variant = validate_variant(variant)
            @name = attribs.delete(:name)
            @components = []

            expand!

            self_label = @label
            @input_text_field = TextField.new(parent: self) do
              label self_label if self_label
            end

            if input? && !name
              logger.warn <<~TEXT
                "\"input\" chip set #{id} is missing the `name` attribute. \
                Its chips will not be included in form data.
              TEXT
            end
          end

          def label(text = nil)
            return @label if locked?
            @label = text
          end

          def choice?
            variant == :choice
          end

          def filter?
            variant == :filter
          end

          def input?
            variant == :input
          end

          private

          def validate_variant(variant)
            return :static unless variant

            variant = variant.to_sym

            unless VARIANTS.include?(variant)
              list = VARIANTS.map(&:inspect).join(', ')
              raise Errors::ParameterValidation, "Chipset variant must be one of #{list}"
            end

            variant
          end
        end
      end
    end
  end
end
