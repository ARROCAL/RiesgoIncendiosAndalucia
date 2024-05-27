
define(['dojo/_base/declare', 
'jimu/BaseWidget', 
'dijit/_WidgetsInTemplateMixin', 
'dojo/on', 
'dojo/_base/lang', 
'dojo/Deferred',
"dojo/dom",
'dojo/parser', 
'dojo/dom-style',
'dojo/dom-construct',
'esri/request', 
"esri/config", 
'jimu/dijit/Message',
"esri/geometry/Extent", 
"esri/SpatialReference",
"dijit/layout/TabContainer",
"dijit/layout/ContentPane",
"dijit/form/FilteringSelect",
"dijit/form/Button"
],

function(declare, BaseWidget, _WidgetsInTemplateMixin, on, lang, Deferred, dom, parser, domStyle, domConstruct, esriRequest, esriConfig, Message,
  Extent, SpatialReference, TabContainer, ContentPane, FilteringSelect, Button ) {
  return declare([BaseWidget], {

    //baseClass: 'jimu-widget-riesgoincendios',

    //this property is set by the framework when widget is loaded.
    // name: 'RiesgoIncendios',

      postCreate: function() {
       
        this.inherited(arguments);
        
       // this.own(on(this.map, "click", lang.hitch(this, "clickMapHandler")));
        this.own(on(this.selectProvincia, "change", lang.hitch(this, "onChangeSelectProvincia")));
        this.own(on(this.btnAceptar,'click', lang.hitch(this, this.onClickAceptar)));
        //parser.parse();

        //parser.parse();
      },


      startup: function () {
        this.inherited(arguments);
       // parser.parse();
        //parser.parse();// SI SE PONE ESTA LINEA SE ARRGLA LA UI PERO SE JODE LOS EVENTOS
      },

      clearData: function(){
       
        //LIMPIAR LOS DATOS DE TEMPERATURA
        var ul = document.getElementById("idUlTemp");
        var items = ul.getElementsByTagName("li");
        for (var i = (items.length - 1) ; i >= 0; i--) {
          if (items[i].id =="") {
            items[i].parentNode.removeChild(items[i])
          }
        }

          //LIMPIAR LOS DATOS DE HUMEDAD
          var ul = document.getElementById("idUlWet");
          var items = ul.getElementsByTagName("li");
          for (var i = (items.length - 1) ; i >= 0; i--) {
            if (items[i].id =="") {
              items[i].parentNode.removeChild(items[i])
            }
          }

             //LIMPIAR LOS DATOS DE VIENTO
             var ul = document.getElementById("idUlWind");
             var items = ul.getElementsByTagName("li");
             for (var i = (items.length - 1) ; i >= 0; i--) {
               if (items[i].id =="") {
                 items[i].parentNode.removeChild(items[i])
               }
             }


      },

      showResult: function (res){


     
        //LIMPIAMOS LOS DATOS PARA QUE NO SE ACUMULEN
        this.clearData()

        //TEMPERATURA
        var tempMax=res[0].prediccion.dia[0].temperatura.maxima;

        if (tempMax >this.config.valorPeligro){
          domStyle.set(dom.byId("idLiTempMax"), "color", "red");
          domStyle.set(dom.byId("idLiTempMax"), "font-weight", "700");
        }

        var tempMin=res[0].prediccion.dia[0].temperatura.minima;
        var liTempMax=dom.byId("idLiTempMax");
        var liTempMin=dom.byId("idLiTempMin");
        liTempMax.textContent = "Máxima: " + tempMax + " ºC";
        liTempMin.textContent = "Mínima: " + tempMin + " ºC";
        
        var arrayTemp=res[0].prediccion.dia[0].temperatura.dato;
        var ulTemp= dom.byId("idUlTemp");
        for (var i = 0; i < arrayTemp.length; i++) {
          
            var li = domConstruct.create("li") ;
            li.innerHTML = "A las " + arrayTemp[i].hora + ":00: " +  + arrayTemp[i].value + " ºC ";
            ulTemp.appendChild(li);
        }
        
        //HUMEDAD
        var wetMax=res[0].prediccion.dia[0].humedadRelativa.maxima;
        var wetMin=res[0].prediccion.dia[0].humedadRelativa.minima;
		wetMin=40

        if (wetMin < this.config.valorPeligro){
          domStyle.set(dom.byId("idLiWetMin"), "color", "red");
          domStyle.set(dom.byId("idLiWetMin"), "font-weight", "700");
        }


        var liWetMax=dom.byId("idLiWetMax");
        var liWetMin=dom.byId("idLiWetMin");
      
        liWetMax.textContent = "Máxima: " + wetMax + " %";
        liWetMin.textContent = "Mínima: " + wetMin + " %";

        var arrayWet=res[0].prediccion.dia[0].humedadRelativa.dato;
        var ulWet= dom.byId("idUlWet");
        
        for (var i = 0; i < arrayWet.length; i++) {
        
          var li = domConstruct.create("li") ;
          li.innerHTML = "A las " + arrayWet[i].hora + ":00: " +  + arrayWet[i].value + " % ";
          ulWet.appendChild(li);
        }

        //VIENTO
        var arrayWind=res[0].prediccion.dia[0].viento;
        var ulWind= document.getElementById("idUlWind")
        for (var i = 0; i < arrayWind.length; i++) {

          if (i > 2){

              var periodo= arrayWind[i].periodo
              var hora;
              switch (periodo) {
                case "00-06":
                  hora= "De 0:00 a 6:00: "
                break
                case "06-12":
                  hora= "De 6:00 a 12:00: "
                break
                case "12-18":
                  hora= "De 12:00 a 18:00: "
                break
                
                case "18-24":
                  hora= "De 18:00 a 24:00: "
                  break
              }

              var _color= "";
              var _fontWeight="";
            
              if (arrayWind[i].velocidad > this.config.valorPeligro){
                _color= "red";
                _fontWeight=700
              }

              var li = domConstruct.create("li", { style: {"color": _color, "font-weight": _fontWeight}}) ;
              li.innerHTML = hora + arrayWind[i].velocidad + " Km\\h - " + arrayWind[i].direccion;
              ulWind.appendChild(li);

        }//FIN IF
      }//FIN BUCLE
        
      //ENLACE AEMET
        var urllinkAemetMuni= res[0].origen.enlace;
        var linkAemetMuni=dom.byId("idLinkAemetMuni");
        linkAemetMuni.href=urllinkAemetMuni;
       
        domStyle.set(dom.byId("idDivResult"), "display", "block");
      
      },//FIN FUNCION

      onClickAceptar: function(){
        
        var codProv=dom.byId("idSelectProvincia").value;
        var codMuni=dom.byId("idSelectMunicipio").value;
        
        if (codProv=='-1'|| codMuni=='-1'){

          new Message({titleLabel:"Aviso", message: "Tiene que seleccionar una Provincia y un Municipio"});
       
          return
        }

        codMuni= codProv +  codMuni

        var urlAemet= this.config.urlAemet.replace("{muni}", codMuni)

       console.log ("LA URL DE LA PETICION AL WS DE LA AEMET ES " + urlAemet);

			this.getWMSData(urlAemet, "aemet").then(lang.hitch(this, function(res){
		
        var urlFinal= res.datos;

        this.getWMSData(urlFinal, "aemet").then(lang.hitch(this, function(res){
          this.showResult(res)
        })), lang.hitch(this, this.manageErrorAemet);
			})), lang.hitch(this, this.manageErrorAemet);
      },

      manageErrorAemet: function()
      {
       
        new Message({titleLabel:"Error", message: "Se ha producido un error al consultar los datos de la AEMET. Contacte con el Administrador."});
      },

      manageErrorGetMuni: function()
      {
        new Message({titleLabel:"Error", message: "Se ha producido un error al consultar los municipios. Contacte con el Administrador."});
      },


      onChangeSelectProvincia: function (){
        var codProv=dom.byId("idSelectProvincia").value;
        //rellenamos el combo de municipios a partir de la provincia seleccionada
        var urlMunicipiosPorProvincia=this.config.urlMunicipiosPorProvincia.replace("{provincia}", codProv)

        this.getWMSData(urlMunicipiosPorProvincia, "municipios").then(lang.hitch(this, function(res){
			
          var arrayMuni = res.features; 

          this.loadSelectMuniByProv(arrayMuni);
         
        })), lang.hitch(this, this.manageErrorGetMuni);

      },
  
  
      loadSelectMuniByProv: function(arrayMuni){

        this.selectMunicipio.innerHTML = "";

        var opt = document.createElement("option");
        opt.value = "-1";
        opt.text = "Seleccione municipio";
        this.selectMunicipio.add(opt);

        for (var i = 0; i < arrayMuni.length; i++) {
          var opt = document.createElement("option");
          opt.value = arrayMuni[i].attributes.MUNICIPIO;
          opt.text = arrayMuni[i].attributes.NOMBRE;
          this.selectMunicipio.add(opt);
      }
      
      },
    
      getWMSData: function(url, request){

        var def = new Deferred();

      //esto es necesario
       esriConfig.defaults.io.corsEnabledServers.push("opendata.aemet.es");

        esriRequest({
          url: url,
          
          type: 'GET',
         
          useProxy: false,
          
          handleAs: "json",
        
        }).then(lang.hitch(this, function(res){
        
          def.resolve(res);
        }), lang.hitch(this, function(err) {
          var error;
          if (request=="municipios"){
            error="Se ha producido un error al consultar los municipios de la provincia. Contacte con el Administrador.";
          }
          else if (request=="aemet"){
            error="Se ha producido un error al consultar la previsión meteorológica del municipio. Revise el API-KEY, el código del municipio, que el servicio web de la AEMET está funcionando correctamente y contacte con el Administrador.";
          }
          
          var mes=  new Message({titleLabel:"Error", message: error});
          console.error(err);
          
          def.reject(err);
        }));
        return def;
      
      },

      onOpen: function(){
		  alert("1")
        var panel = this.getPanel();    
        panel.position.width = 535; 
        panel.position.height = 535; 
        panel.setPosition(panel.position);        
        panel.panelManager.normalizePanel(panel);          
      },

      onClose: function(){   
        
        this.selectProvincia.value=-1
        this.selectMunicipio.value=-1
        domStyle.set(dom.byId("idDivResult"), "display", "none");
        this.clearData();

      }, 
  
  });
});