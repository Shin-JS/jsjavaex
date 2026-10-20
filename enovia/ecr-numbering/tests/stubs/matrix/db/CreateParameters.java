package matrix.db;
public class CreateParameters {
    private String type;
    private String name;
    public String getType() { return type; }
    public String getName() { return name; }
    public CreateParameters setType(String type) { this.type = type; return this; }
    public CreateParameters setName(String name) { this.name = name; return this; }
}
