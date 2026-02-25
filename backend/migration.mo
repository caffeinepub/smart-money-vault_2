module {
  type OldActor = {
    // Original actor type (no changes needed)
  };

  type NewActor = {
    // New actor type (no changes needed)
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
