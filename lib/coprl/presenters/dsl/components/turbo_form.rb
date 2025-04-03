module Coprl
  module Presenters
    module DSL
      module Components
        class TurboForm < Base
          include Mixins::TextFields
          include Mixins::DateTimeFields
          include Mixins::Selects
          include Mixins::Attaches
          include Mixins::FileInputs
          include Mixins::Images
          include Mixins::Tables
          include Mixins::Chipset
          include Mixins::Common

          attr_reader :components, :shows_errors, :action, :method_type

          def initialize(**attribs_, &block)
            super(type: :turbo_form, **attribs_, &block)
            @shows_errors = attribs.delete(:shows_errors){true}
            @action = attribs.delete(:action)
            @method_type = attribs.delete(:method){"post"}
            @components = []
            expand!
          end
        end
      end
    end
  end
end
