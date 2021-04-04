
    var gLoginUserName;     

    function logCurrentUserVisitToPage() {
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
      checkForHitCountLog(); 
    }

    function onQueryFailed(sender, args) {
      console.log(
        "request failed " + args.get_message() + "\n" + args.get_stackTrace()
      );
    }
   function checkForHitCountLog(){	 
    //  var curDate = (new Date()).getMonth()+"-"+ (new Date()).getDate()+"-"+  (new Date()).getFullYear();
      var curDate = (new Date()).getDate()+"_"+ ((new Date()).getMonth()+1)+"_"+  (new Date()).getFullYear();
      
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle("Page_Usage_Log");
        var camlQuery = new SP.CamlQuery();

        var cmlQuery = " <View>"; 
              cmlQuery   += " <Query>";
                cmlQuery  += " <Where>"; 
                  cmlQuery  += " <And>";
                  
                    cmlQuery  += " <Eq>";
                      cmlQuery  += " <FieldRef Name='UserName' />";
                      cmlQuery  += " <Value Type='Text'>"+gLoginUserName+"</Value>";
                    cmlQuery  += " </Eq>";
                    
                     cmlQuery  += " <And>";

                     cmlQuery  += " <Eq>";
                       cmlQuery  += " <FieldRef Name='Title' />";
                       cmlQuery  += " <Value Type='Text'>"+document.title +"</Value>";
                     cmlQuery  += " </Eq>";

                    cmlQuery  += " <Eq>";
                      cmlQuery  += " <FieldRef Name='VisitedDate' />";
                      cmlQuery  += " <Value Type='Text'>"+curDate +"</Value>";
                    cmlQuery  += " </Eq>";   

                  cmlQuery  += " </And>"; 
                  cmlQuery  += " </And>"; 
                cmlQuery  += " </Where>";
              cmlQuery  += " </Query>";  
            cmlQuery  += " </View>";  
        
          camlQuery.set_viewXml(cmlQuery);
        this.collListItem = oList.getItems(camlQuery);
        clientContext.load(collListItem, 'Include(Title, UserName, VisitedDate, HitCount)');

        clientContext.load(collListItem);	
          var count = 0;
        clientContext.executeQueryAsync(function(){			
             var listItemEnumerator = collListItem.getEnumerator();				
            while (listItemEnumerator.moveNext()) { 
              var oListItem = listItemEnumerator.get_current(); 
               count = count + 1;
                var newHitCount = parseInt(oListItem.get_item("HitCount")) + 1; 
                oListItem.set_item("HitCount", newHitCount); 
                oListItem.update(); 
                clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
             }
             debugger
           if(count == 0){
             insertCurrentUserVisitLog();
           }

         }, function(sender, args){
          console.log("Request failed. " + args.get_message() + "\n" + args.get_stackTrace());
        });	 
  }  

    function insertCurrentUserVisitLog() {
     var curDate = (new Date()).getDate()+"_"+ ((new Date()).getMonth()+1)+"_"+  (new Date()).getFullYear();
      var clientContext = new SP.ClientContext();
      var oWeb = clientContext.get_web();
      this.currentUser = oWeb.get_currentUser();
      clientContext.load(currentUser);

      // Specify list title here
      var oList = oWeb.get_lists().getByTitle("Page_Usage_Log");

      // Get Item using CAML Query
      var camlQuery = new SP.CamlQuery();

      // New "ListItemCreationInformation" Object
      var oListItemCreationInformation = new SP.ListItemCreationInformation();
      var oListItem = oList.addItem(oListItemCreationInformation);

      // Set value for each column here
      oListItem.set_item("Title", document.title);      
      oListItem.set_item("UserName", gLoginUserName);      
      oListItem.set_item("PageURL", window.location.href); 
      oListItem.set_item("VisitedDate", curDate);      
      oListItem.set_item("HitCount", "1"); 
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
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", logCurrentUserVisitToPage);
    });
