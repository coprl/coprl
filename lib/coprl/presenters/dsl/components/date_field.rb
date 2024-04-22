require 'coprl/presenters/dsl/components/datetime_base'

module Coprl
  module Presenters
    module DSL
      module Components
        class DateField < DatetimeBase
          attr_reader :config, :locale

          def initialize(**attribs_, &block)
            super(type: :date, **attribs_, &block)

            merge_config(:min_date)
            merge_config(:max_date)

            hint ""

            @locale = attribs[:locale]

            expand!
          end

          def validation_error(error = nil)
            return @validation_error if locked?
            @validation_error ||= error
          end
        end
      end
    end
  end
end
