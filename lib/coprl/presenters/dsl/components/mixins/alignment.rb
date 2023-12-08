module Coprl::Presenters::DSL::Components::Mixins
  module Alignment
    attr_reader :align, :justify

    private

    DIRECTIONS = %i[row column].freeze
    ALIGNMENTS = %i[start center end stretch].freeze
    DIRECTIONS_STRING = DIRECTIONS.map(&:inspect).join(', ').freeze
    ALIGNMENTS_STRING = ALIGNMENTS.map(&:inspect).join(', ').freeze
    DEPRECATED_ALIGNMENTS = {left: :start, right: :end}.freeze

    def validate_direction!(direction)
      return unless direction

      sym = direction.to_sym

      unless DIRECTIONS.include?(sym)
        raise Coprl::Presenters::Errors::InvalidDsl,
              "Invalid direction: expected one of #{DIRECTIONS_STRING}"
      end

      sym
    end

    def validate_alignment!(alignment)
      return unless alignment

      sym = alignment.to_sym

      if DEPRECATED_ALIGNMENTS.key?(sym)
        logger.warn ':left and :right alignments are deprecated ' \
                    'and will be removed in a future release. Please migrate ' \
                    "usages to one of #{ALIGNMENTS_STRING}."

        sym = DEPRECATED_ALIGNMENTS[sym]
      end

      sym
    end
  end
end
