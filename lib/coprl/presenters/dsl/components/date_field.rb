require 'coprl/presenters/dsl/components/datetime_base'

module Coprl
  module Presenters
    module DSL
      module Components
        class DateField < DatetimeBase
          DEFAULT_HINT = 'Enter date as MM/DD/YYYY'
          DEFAULT_ERROR = "Invalid date. #{DEFAULT_HINT}"

          attr_reader :config, :has_different_menus, :selected_menu, :unselected_menu

          def initialize(**attribs_, &block)
            super(type: :date, **attribs_, &block)

            merge_config(:min_date)
            merge_config(:max_date)
            merge_config(:inline)

            unless @picker
              @hint ||= DEFAULT_HINT
              @validation_error ||= DEFAULT_ERROR
            end

            # expand! is called by DatetimeBase -> TextField
          end

          def validation_error(error=nil)
            return @validation_error if locked?
            @validation_error ||= error
          end

          # specifies the same menu for both selected and unselected days
          def menu(**attributes, &block)
            return @selected_menu if locked?

            if config && !config[:inline]
              raise Errors::InvalidDsl, '#menu can only be used with an `inline: true` date field'
            end

            menu = Components::Menu.new(parent: self, **attributes, &block)
            @selected_menu = menu
          end

          # menu for selected days
          def selected_menu(**attributes, &block)
            return @selected_menu if locked?

            if config && !config[:inline]
              raise Errors::InvalidDsl, '#selected_menu can only be used with an `inline: true` date field'
            end

            @selected_menu = Components::Menu.new(parent: self, **attributes, &block)
          end

          # menu for unselected days
          def unselected_menu(**attributes, &block)
            return @unselected_menu if locked?

            if config && !config[:inline]
              raise Errors::InvalidDsl, '#unselected_menu can only be used with an `inline: true` date field'
            end

            @unselected_menu = Components::Menu.new(parent: self, **attributes, &block)
          end
        end
      end
    end
  end
end

