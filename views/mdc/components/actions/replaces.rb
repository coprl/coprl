require 'voom/presenters/web_client/helpers/expand_hash'

module WebClient
  module Actions
    class Replaces
      include ExpandHash
      def call(action, parent_id, grid_nesting, *)
        # Type, URL, Options, Params (passed into javascript event/action classes)
        [action.type, action.url,
         action.options.to_h.merge({grid_nesting: grid_nesting, __parent_id__: parent_id, input_tag: action.options[:input_tag]}),
         expand_hash(action.dynamic_params)]
      end
    end
  end
end
