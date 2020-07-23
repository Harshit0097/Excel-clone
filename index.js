const $=require('jQuery');
const electron=require('electron').remote;
const dialog=electron.dialog;
const fsp= require('fs').promises;
//console.log($);
$(document).ready(function(){
   let rows=[];
    $('#content-container').on('scroll', function(){
        $('#first-row').css('top',$('#content-container').scrollTop());
        $('#first-col').css('left',$('#content-container').scrollLeft());
        $('#t1-cell').css('top',$('#content-container').scrollTop());
        $('#t1-cell').css('left',$('#content-container').scrollLeft());
    });
    $('#new').on('click',function(){
        rows=[];
        $('#grid').find('.row').each(function(){
            let cells=[];
            $(this).find('.cell').each(function(){
                let cell=getDefaultCell();
                cells.push(cell);
                prepareCellDiv(this,cell);
            })
            rows.push(cells);
        })
        $('#grid .cell:first').click();
        //$('#grid .cell.selected').click();
        $('#home-menu').click();
    });

    function getDefaultCell()
    {
        let cell={
            val:'',
            fontFamily:'Tahoma',
            fontSize:'10',
            bold:false,
            italic:false,
            underline:false,
            bgColor:'#ffffff',
            textColor:'#000000',
            valign:'middle',
            halign:'left',
            formula:'',
            upstream:[],
            downstream:[]
        };
        return cell;
    }

    function prepareCellDiv(cdiv,cobj)
    {
        $(cdiv).html(cobj.val);
        $(cdiv).css('font-family',cobj.fontFamily);
        $(cdiv).css('font-size',cobj.fontSize+'px');
        $(cdiv).css('font-weight',cobj.bold?'bold':'normal');
        $(cdiv).css('font-style',cobj.italic?'italic':'normal');
        $(cdiv).css('text-decoration',cobj.underline?'underline':'none');
        $(cdiv).css('background-color',cobj.bgColor);
        $(cdiv).css('color',cobj.textColor); 
        $(cdiv).css('text-align',cobj.halign);
    }

    function updateVal(rid,cid,val,render)
    {
        let cobj=rows[rid][cid];
        cobj.val=val;
        if(render==true)
            $('.cell[rid='+rid+'][cid='+cid+']').html(val);
        for(let i=0;i<cobj.downstream.length;i++)
        {
            let dso=cobj.downstream[i];
            let fdso=rows[dso.rid][dso.cid];
            //let formula=fdso.formula;
            let nval=evaluateFormula(fdso);
            updateVal(dso.rid,dso.cid,nval,true);
        }
    }

    function evaluateFormula(cobj)
    {
        formula=cobj.formula;//infix expression evaluation
        for(let i=0;i<cobj.upstream.length;i++){
            let uso=cobj.upstream[i];
            let fuso=rows[uso.rid][uso.cid];
            let cellName= String.fromCharCode('A'.charCodeAt(0)+uso.cid)+(uso.rid+1);  
            formula= formula.replace(cellName,fuso.val||0);
        }
        let nval=eval(formula);
        return nval;
    }

    function deleteFormula(rid,cid)
    {
        let cobj=rows[rid][cid];
            cobj.formula='';
            for(let i=0;i<cobj.upstream.length;i++)
            {
                let uso=cobj.upstream[i];
                //delete me from your downstream
                let fuso=rows[uso.rid][uso.cid];
                for(let j=fuso.downstream.length-1;j>=0;j--)
                {
                    let dso=fuso.downstream[j];
                    if(dso.rid==rid&&dso.cid==cid)
                    {
                        fuso.downstream.splice(j,1);
                        break;
                    }
                }
            }
            cobj.upstream=[];
    }
    function setupFormula(rid,cid,formula)
    {
        let cobj=rows[rid][cid];
        cobj.formula=formula;

            //set upstream-downstream
        formula=formula.replace('(','').replace(')','')
        let comps=formula.split(' ');
        for(let i=0;i<comps.length;i++)
        {
            if(comps[i].charCodeAt(0)>="A".charCodeAt(0) && comps[i].charCodeAt(0)<="Z".charCodeAt(0) )
            {
                let urid=parseInt(comps[i].substr(1)-1);
                let ucid=comps[i].charCodeAt(0)-"A".charCodeAt(0);
                cobj.upstream.push({
                    rid:urid,
                    cid:ucid
                })
                let fuso=rows[urid][ucid];
                fuso.downstream.push({
                    rid:rid,
                    cid:cid
                })
            }
        }
    }

    $('#menu-bar > div').on('click',function(){
        $('#menu-bar > div').removeClass('selected');
        $(this).addClass('selected');

        let menuContainerId=$(this).attr('data-content');
        $('#menu-content-container > div').css('display','none');
        $('#'+menuContainerId).css('display','flex');
    });
        
    $('#bold').on('click',function(){
        $(this).toggleClass('selected');
        let bold=$(this).hasClass('selected');
        $('#grid .cell.selected').each(function(){
            $(this).css('font-weight',bold?'bold':'none');
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.bold=bold;
        });
    })

    $('#italic').on('click',function(){
        $(this).toggleClass('selected');
        let italic=$(this).hasClass('selected');
        $('#grid .cell.selected').each(function(){
            $(this).css('font-style',italic?'italic':'none');
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.italic=italic;
        });
    })

    $('#underline').on('click',function(){
        $(this).toggleClass('selected');
        let underline=$(this).hasClass('selected');
        $('#grid .cell.selected').each(function(){
            $(this).css('text-decoration',underline?'underline':'none');
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.underline=underline;
        });
    })

    $('#bg-color').on('change',function(){
        //$(this).toggleClass('selected');
        let bgColor=$(this).val();
        $('#grid .cell.selected').each(function(){
            $(this).css('background-color',bgColor);
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.bgColor=bgColor;
        });
    })
    $('#text-color').on('change',function(){
       // $(this).toggleClass('selected');
        let textColor=$(this).val();
        $('#grid .cell.selected').each(function(){
            $(this).css('color',textColor);
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.textColor=textColor;
        });
    })

    $('.valign').on('click',function(){
        $('.valign').removeClass('selected');
        $(this).addClass('selected');
    })
    $('.halign').on('click',function(){
        $('.halign').removeClass('selected');
        $(this).addClass('selected');

        let halign=$(this).attr('prop-val');
        $('#grid .cell.selected').each(function(){
            $(this).css('text-align',halign);
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.halign=halign;
        })
    })
    
    $('#open').on('click',async function(){
        let dobj=await dialog.showOpenDialog();
        let data=await fsp.readFile(dobj.filePaths[0]);
        rows=JSON.parse(data);
        let i=0;
        $('#grid').find('.row').each(function(){
            let j=0;
            $(this).find('.cell').each(function(){
                let cell=rows[i][j];
                prepareCellDiv(this,cell);
                j++;
            })
            i++;
        })
        $('#grid  .cell:first').click();
        $('#home-menu').click();
    });


    $('#save').on('click',async function(){
        //let rows=[];
        let dobj= await dialog.showSaveDialog();
        await fsp.writeFile(dobj.filePath, JSON.stringify(rows));
        alert('saved successfully');
        $('#home-menu').click();
    });

    $('#grid .cell').on('click',function(e){
        if(e.ctrlKey)
        {
            $(this).addClass('selected');
        }else{
            $('#grid .cell').removeClass('selected');
            $(this).addClass('selected');
        }
        let rid = parseInt($(this).attr('rid'));
        let cid = parseInt($(this).attr('cid'));
        let cobj=rows[rid][cid];
        if(cobj.bold){
            $('#bold').addClass('selected');
        }else{
            $('#bold').removeClass('selected');
        }

        if(cobj.italic){
            $('#italic').addClass('selected');
        }else{
            $('#italic').removeClass('selected');
        }
        if(cobj.underline){
            $('#underline').addClass('selected');
        }else{
            $('#underline').removeClass('selected');
        }
        $('#bg-color').val(cobj.bgColor);
        $('#text-color').val(cobj.textColor);
        $('.halign').removeClass('selected');
        $('.halign[prop-val='+cobj.halign+']').addClass('selected');
        $('#font-family').val(cobj.fontFamily);
        $('#font-size').val(cobj.fontSize);
        $('#cell-formula').val(String.fromCharCode(cid+65)+(rid+1));
        $('#text-formula').val(cobj.formula);
    })

    $('#grid .cell').on('keyup',function(e){
        let rid = parseInt($(this).attr('rid'));
        let cid = parseInt($(this).attr('cid'));
        let cobj=rows[rid][cid];
        if(cobj.formula)
        {
            $('#text-formula').val('');
            deleteFormula(rid,cid);
        }
           updateVal(rid,cid,$(this).html(),false);
    })

    $('#text-formula').on('blur',function(){
        let formula=$(this).val();
        $('#grid .cell.selected').each(function(){
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            //if old formula
            if(cobj.formula)
            {
                //$('#text-formula').val('');
                deleteFormula(rid,cid);
            }

            setupFormula(rid,cid,formula);
            //traverse and check for cycle(to be done)

            let nval=evaluateFormula(cobj);//infix evaluation
            updateVal(rid,cid,nval,true);    
            
        })
    })

    
    $('#font-family').on('change',function(){
        let fontFamily= $(this).val();
        $('#grid .cell.selected').each(function(){
            $(this).css('font-family',fontFamily);
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];
            cobj.fontFamily=fontFamily;
        });
    });

    $('#font-size').on('change',function(){
        let fontSize=$(this).val();
        //console.log(fontSize);
        $('#grid .cell.selected').each(function(){
            $(this).css('font-size',fontSize);
            let rid = parseInt($(this).attr('rid'));
            let cid = parseInt($(this).attr('cid'));
            let cobj=rows[rid][cid];   
            cobj.fontsize=fontSize;
        });
    });

    $('#new').click();

});