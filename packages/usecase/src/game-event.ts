
import { GameEventRepository, GameEventCollection, GameEvent, HKTCollectionName, HKTCollectionNameU, nextTiming  } from "pdomain/game-event";
import { Moment } from "moment";
export abstract class GameEventUseCase{
    async abstract listCollectionName(collectionGroupId:string):Promise<HKTCollectionNameU<HKTCollectionName>[]>;
    async abstract collection(collectionGroupId:string,collectionName:string):Promise<GameEventCollection<HKTCollectionName>>;
    async abstract put(collectionGroupId:string,collectionName:string,src:GameEvent):Promise<void>;
    async abstract allEvents(collectionGroupId:string):Promise<GameEvent[]>;
    async abstract nextEvents(collectionGroupId:string,now:Moment):Promise<[GameEvent,Moment][]>
}
export class GameEventUseCaseImpl<repoT extends GameEventRepository<collectionGroupIdT,HKTCollectionNameT>,collectionGroupIdT,HKTCollectionNameT extends HKTCollectionName> extends GameEventUseCase{
    private readonly repo:repoT
    constructor(repo:repoT,){
        super()
        this.repo=repo
    }
    async listCollectionName(collectionGroupId:string):Promise<HKTCollectionNameU<HKTCollectionNameT>[]>{
        const gid=await this.repo.collcetionGroupId(collectionGroupId);
        return await this.repo.listCollectionName(gid)
    }
    async allEvents(collectionGroupId:string):Promise<GameEvent[]>{
        const gid=await this.repo.collcetionGroupId(collectionGroupId);
        const names=await this.repo.listCollectionName(gid);
        return (await Promise.all(names.map(e=>this.repo.collection(gid,e)))).flatMap(e=>e.events as GameEvent[])
    }
    async nextEvents(collectionGroupId:string,now:Moment):Promise<[GameEvent,Moment][]>{
        const gid=await this.repo.collcetionGroupId(collectionGroupId);
        const names=await this.repo.listCollectionName(gid);
        const arr=(await Promise.all(
            names.map(
                e=> this.repo.collection(gid,e)
            ).flatMap(e=>
                e.then(
                    e2=>(e2.events as GameEvent[]).map(
                        (e3:GameEvent):[GameEvent,Moment]=>[e3,nextTiming(e3,now)]
                    )
                )
            ))).flat().sort(([ae,at],[be,bt])=>at.diff(bt));
        return arr;
    }
    async collection(collectionGroupId:string,collectionName:string):Promise<GameEventCollection<HKTCollectionNameT>>{
        const gid=await this.repo.collcetionGroupId(collectionGroupId);
        return this.repo.collection(gid,await this.repo.collectionName(gid,collectionName))
    }
    async put(collectionGroupId:string,collectionName:string,src:GameEvent){
        const gid=await this.repo.collcetionGroupId(collectionGroupId);

        return this.repo.put(gid,await this.repo.collectionName(gid,collectionName),src)
    }
}