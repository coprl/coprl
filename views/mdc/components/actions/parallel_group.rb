module WebClient
  module Actions
    class ParallelGroup
      include Coprl::Presenters::WebClient::Helpers::ExpandHash

      def call(action, parent_id, grid_nesting, comp, *)
        actions = action.actions.map do |action|
          action_proc = WebClient::Actions::Resolver.new(comp, action).resolve
          action_proc.call(action, parent_id, grid_nesting, comp)
        end

        options = {__parent_id__: parent_id}
        params = {actions: actions}

        # Type, URL, Options, Params (passed into javascript event/action classes)
        [action.type, nil, expand_hash(options), expand_hash(params)]
      end
    end
  end
end
