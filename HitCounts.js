
    var gLoginUserName;

    function executeHitCounts() {
         getCurrentLoginUserName();
    }

    function getCurrentLoginUserName() {
      var context = new SP.ClientContext.get_current();
      this.website = context.get_web();
      this.currentUser = website.get_currentUser();
      context.load(currentUser);
      context.executeQueryAsync(
        Function.createDelegate(this, this.onQuerySucceeded),
        Function.createDelegate(this, this.onQueryFailed)
      );
    }

    function onQuerySucceeded(sender, args) {
      gLoginUserName = currentUser.get_loginName();
      populatePageUsageLog();
 
    }

    function onQueryFailed(sender, args) {
      console.log(
        "request failed " + args.get_message() + "\n" + args.get_stackTrace()
      );
    }

    function populatePageUsageLog() {
      var clientContext = new SP.ClientContext();
      var oWeb = clientContext.get_web();
      this.currentUser = oWeb.get_currentUser();
      clientContext.load(currentUser);

      // Specify list title here
      var oList = oWeb.get_lists().getByTitle("PageUsageLog");

      // Get Item using CAML Query
      var camlQuery = new SP.CamlQuery();

      // New "ListItemCreationInformation" Object
      var oListItemCreationInformation = new SP.ListItemCreationInformation();
      var oListItem = oList.addItem(oListItemCreationInformation);

      // Set value for each column here
      oListItem.set_item("Title", gLoginUserName);
      oListItem.set_item("PageURL", window.location.href);
      oListItem.set_item("HitCount", "This is dummy data");

      oListItem.update();

      clientContext.load(oListItem);

      // Execute the query to the server.
      clientContext.executeQueryAsync(onsuccess, onfailed);
    }

    function onsuccess() {
       console.log("Success");
    }

    function onfailed(sender, args) {
      console.log("Failed" + args.get_message() + "\n" + args.get_stackTrace());
    }
    


    jQuery(document).ready(function () {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", executeHitCounts);
    });
