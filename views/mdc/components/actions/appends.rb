module WebClient
  module Actions
    class Appends
      include Coprl::Presenters::WebClient::Helpers::ExpandHash

      def call(action, parent_id, *)
        options = action.options.to_h.merge({
          __parent_id__: parent_id,
          input_tag: action.options[:input_tag]
        })

        [
          action.type,
          action.url,
          options,
          expand_hash(action.dynamic_params)
        ]
      end
    end
  end
end
