module Coprl
  module Presenters
    module DSL
      module Components
        module Mixins
          module Padding
            private

            POSITIONS = %i[top right bottom left].sort.freeze
            SIZES = [0, 1, 2, 3, 4, 5].freeze

            SINGLE_VALUES = [true, :full, :all, false, :none].freeze
            SINGLES_STRING = SINGLE_VALUES.map(&:inspect).join(', ').freeze

            SIZED_VALUES = POSITIONS.product(SIZES).map { |a| a.join.to_sym }.freeze

            POSITION_VALUES = (POSITIONS + SIZED_VALUES).freeze
            POSITIONS_STRING = POSITION_VALUES.map(&:inspect).join(', ').freeze

            def coerce_padding(padding, default_level: Presenters::Settings.config.presenters.components.defaults.padding.default_size)
              case padding
              when true, :full, :all
                POSITIONS.product([default_level]).map { |a| a.join.to_sym }
              when false, :none
                []
              else
                Array(padding).map do |item|
                  POSITIONS.include?(item) ? :"#{item}#{default_level}" : item
                end
              end
            end

            # Validate the provided padding array or single value, silently
            # discarding any invalid entries if the argument is an array.
            #
            # If the argument is not (or does not contain) a valid padding
            # value, an error is raised.
            def validate_padding!(padding)
              return [] if padding.nil? || padding.empty?

              if (valid_entries = (Array(padding) & POSITION_VALUES)).any?
                return valid_entries
              end

              if SINGLE_VALUES.include?(padding)
                return Array(padding)
              end

              raise Errors::ParameterValidation,
                    "Padding must be either be #{SINGLES_STRING} or an array " \
                    "containing zero or more of the following: #{POSITIONS_STRING}"
            end
          end
        end
      end
    end
  end
end
